/**
 * Persistencia local multi-journal con la API de expo-file-system (SDK 54+).
 * Estructura en disco (ver docs/03-modelo-datos.md):
 *
 *   documentDirectory/journals/<id>/journal.json
 *   documentDirectory/journals/<id>/media/<file>
 *
 * Operaciones síncronas (File/Directory). rotation se guarda en radianes.
 */
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

import {
  CanvasItem,
  Cover,
  DEFAULT_BACKGROUND,
  DEFAULT_COVER,
  Journal,
  JournalSummary,
  Page,
  SCHEMA_VERSION,
} from '../models/journal';

const newPage = (): Page => ({
  id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
  background: { ...DEFAULT_BACKGROUND },
  items: [],
});

const JOURNALS_DIR = 'journals';
const JOURNAL_FILE = 'journal.json';
const MEDIA_DIR = 'media';

function journalsRoot(): Directory {
  const dir = new Directory(Paths.document, JOURNALS_DIR);
  if (!dir.exists) dir.create();
  return dir;
}

function journalDir(id: string): Directory {
  return new Directory(journalsRoot(), id);
}

function journalFile(id: string): File {
  return new File(journalDir(id), JOURNAL_FILE);
}

const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

/** Lista los journals para la estantería, del más reciente al más antiguo. */
export function listJournals(): JournalSummary[] {
  try {
    const entries = journalsRoot().list();
    const summaries: JournalSummary[] = [];
    for (const entry of entries) {
      if (!(entry instanceof Directory)) continue;
      const file = new File(entry, JOURNAL_FILE);
      if (!file.exists) continue;
      try {
        const j = JSON.parse(file.textSync()) as Journal & { items?: CanvasItem[] };
        const pages = Array.isArray(j.pages) ? j.pages : [];
        const allItems = pages.length
          ? pages.flatMap((p) => p.items ?? [])
          : Array.isArray(j.items)
            ? j.items
            : [];
        const cover = allItems.find((i) => i.kind === 'photo');
        summaries.push({
          id: j.id,
          title: j.title,
          updatedAt: j.updatedAt,
          coverUri: cover && cover.kind === 'photo' ? cover.uri : undefined,
          coverColor: j.cover?.color ?? DEFAULT_COVER.color,
          coverStyle: j.cover?.style ?? DEFAULT_COVER.style,
          count: allItems.length,
        });
      } catch {
        // journal corrupto: lo ignoramos
      }
    }
    summaries.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    return summaries;
  } catch {
    return [];
  }
}

/** Crea un journal vacío y devuelve su modelo. */
export function createJournal(title: string, cover: Cover = DEFAULT_COVER): Journal {
  const id = newId('j');
  const now = new Date().toISOString();
  const dir = journalDir(id);
  if (!dir.exists) dir.create();
  const media = new Directory(dir, MEDIA_DIR);
  if (!media.exists) media.create();

  const journal: Journal = {
    schemaVersion: SCHEMA_VERSION,
    id,
    title,
    createdAt: now,
    updatedAt: now,
    cover: { ...cover },
    pages: [newPage()],
  };
  journalFile(id).write(JSON.stringify(journal));
  return journal;
}

/** Cambia solo la portada de un journal (color y/o estilo). */
export function setJournalCover(id: string, cover: Cover): void {
  const j = loadJournal(id);
  if (!j) return;
  saveJournal({ ...j, cover });
}

export function loadJournal(id: string): Journal | null {
  try {
    const file = journalFile(id);
    if (!file.exists) return null;
    const j = JSON.parse(file.textSync()) as Journal;
    if (!j || typeof j !== 'object') return null;
    return j;
  } catch {
    return null;
  }
}

export function saveJournal(journal: Journal): void {
  try {
    const updated: Journal = {
      ...journal,
      schemaVersion: SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    };
    journalFile(journal.id).write(JSON.stringify(updated));
  } catch (e) {
    console.warn('No se pudo guardar el journal', e);
  }
}

export function deleteJournal(id: string): void {
  try {
    const dir = journalDir(id);
    if (dir.exists) dir.delete();
  } catch (e) {
    console.warn('No se pudo borrar el journal', e);
  }
}

/**
 * Copia una imagen elegida (uri temporal) a la carpeta media del journal y
 * devuelve la uri persistente. Si falla, devuelve la original como fallback.
 */
export function persistImage(journalId: string, srcUri: string): string {
  try {
    const media = new Directory(journalDir(journalId), MEDIA_DIR);
    if (!media.exists) media.create();

    const cleanUri = srcUri.split('?')[0];
    const extMatch = cleanUri.match(/\.(\w+)$/);
    const ext = extMatch ? extMatch[1] : 'jpg';
    const name = `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const dest = new File(media, name);
    new File(srcUri).copy(dest);
    return dest.uri;
  } catch (e) {
    console.warn('No se pudo copiar la imagen a media/', e);
    return srcUri;
  }
}

function remapMediaUri(mediaDir: Directory, uri: string): string {
  const name = uri.split('/').pop();
  return name ? new File(mediaDir, name).uri : uri;
}

/** Exporta una libreta a un archivo .reminly (zip) y abre el menú de compartir. */
export async function exportJournal(id: string): Promise<void> {
  const j = loadJournal(id);
  if (!j) return;

  const files: Record<string, Uint8Array> = {
    'manifest.json': strToU8(
      JSON.stringify({
        app: 'Reminly',
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        title: j.title,
      })
    ),
    'journal.json': strToU8(JSON.stringify(j)),
  };

  const mediaDir = new Directory(journalDir(id), MEDIA_DIR);
  if (mediaDir.exists) {
    for (const entry of mediaDir.list()) {
      if (entry instanceof File) {
        files[`media/${entry.name}`] = entry.bytesSync();
      }
    }
  }

  const zipped = zipSync(files);
  const safe =
    (j.title || 'reminly').trim().replace(/[^\w\-]+/g, '_') || 'reminly';
  const out = new File(Paths.cache, `${safe}.reminly`);
  try {
    if (out.exists) out.delete();
  } catch {
    // si no se puede borrar, write lo sobrescribe
  }
  out.write(zipped);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(out.uri, {
      mimeType: 'application/zip',
      dialogTitle: 'Compartir libreta',
    });
  }
}

/** Importa un archivo .reminly como una libreta nueva. Devuelve su id o null. */
export async function importJournal(): Promise<string | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });
  if (res.canceled || !res.assets?.[0]) return null;

  try {
    const bytes = new File(res.assets[0].uri).bytesSync();
    const unzipped = unzipSync(bytes);
    const raw = unzipped['journal.json'];
    if (!raw) return null;
    const j = JSON.parse(strFromU8(raw)) as {
      title?: string;
      cover?: Cover;
      pages?: Page[];
      items?: CanvasItem[];
      background?: typeof DEFAULT_BACKGROUND;
    };
    if (!j || typeof j !== 'object') return null;

    const id = newId('j');
    const now = new Date().toISOString();
    const dir = journalDir(id);
    if (!dir.exists) dir.create();
    const media = new Directory(dir, MEDIA_DIR);
    if (!media.exists) media.create();

    for (const path of Object.keys(unzipped)) {
      if (path.startsWith('media/')) {
        const name = path.slice('media/'.length);
        if (name) new File(media, name).write(unzipped[path]);
      }
    }

    const VALID_KINDS = ['photo', 'text', 'sticker', 'washi', 'audio', 'video'];
    const sanitize = (raw: CanvasItem[]): CanvasItem[] =>
      (Array.isArray(raw) ? raw : [])
        .filter((it) => it && VALID_KINDS.includes((it as { kind?: string }).kind ?? ''))
        .slice(0, 2000)
        .map((it) =>
          it.kind === 'photo' || it.kind === 'video' || it.kind === 'audio'
            ? { ...it, uri: remapMediaUri(media, it.uri) }
            : it
        ) as CanvasItem[];

    // Soporta export nuevo (pages) y legacy (items en raíz).
    const srcPages: Page[] = Array.isArray(j.pages)
      ? j.pages
      : Array.isArray(j.items)
        ? [{ id: '', background: j.background ?? DEFAULT_BACKGROUND, items: j.items }]
        : [];
    if (srcPages.length === 0) return null;

    const pages: Page[] = srcPages.slice(0, 200).map((p) => ({
      id: newId('p'),
      background: p?.background ?? DEFAULT_BACKGROUND,
      items: sanitize(p?.items ?? []),
    }));

    const imported: Journal = {
      schemaVersion: SCHEMA_VERSION,
      id,
      title: `${j.title ?? 'Libreta'} (importada)`,
      createdAt: now,
      updatedAt: now,
      cover: j.cover ?? DEFAULT_COVER,
      pages,
    };
    new File(dir, JOURNAL_FILE).write(JSON.stringify(imported));
    return id;
  } catch (e) {
    console.warn('No se pudo importar el archivo', e);
    return null;
  }
}
