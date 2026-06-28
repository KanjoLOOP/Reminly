/**
 * Persistencia local multi-journal con la API de expo-file-system (SDK 54+).
 * Estructura en disco (ver docs/03-modelo-datos.md):
 *
 *   documentDirectory/journals/<id>/journal.json
 *   documentDirectory/journals/<id>/media/<file>
 *
 * Operaciones síncronas (File/Directory). rotation se guarda en radianes.
 */
import { Directory, File, Paths } from 'expo-file-system';

import {
  CanvasItem,
  Cover,
  DEFAULT_BACKGROUND,
  DEFAULT_COVER,
  Journal,
  JournalSummary,
  SCHEMA_VERSION,
} from '../models/journal';

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
        const j = JSON.parse(file.textSync()) as Journal;
        const cover = j.items.find((i) => i.kind === 'photo');
        summaries.push({
          id: j.id,
          title: j.title,
          updatedAt: j.updatedAt,
          coverUri: cover && cover.kind === 'photo' ? cover.uri : undefined,
          coverColor: j.cover?.color ?? DEFAULT_COVER.color,
          coverStyle: j.cover?.style ?? DEFAULT_COVER.style,
          count: j.items.length,
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
    background: { ...DEFAULT_BACKGROUND },
    items: [],
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
    if (!j || !Array.isArray(j.items)) return null;
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
