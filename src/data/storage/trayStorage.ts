/**
 * Persistencia de la bandeja de recuerdos. Estructura:
 *   documentDirectory/tray/tray.json
 *   documentDirectory/tray/media/<file>
 *
 * Al convertir, los items se vuelcan a una libreta (nueva o existente) copiando
 * la media a la carpeta de esa libreta.
 */
import { Directory, File, Paths } from 'expo-file-system';

import { CanvasItem, DEFAULT_BACKGROUND } from '../models/journal';
import { TrayItem } from '../models/tray';
import { applyLayout } from '../layouts';
import {
  createJournal,
  loadJournal,
  persistImage,
  saveJournal,
} from './journalStorage';

const TRAY_DIR = 'tray';
const TRAY_FILE = 'tray.json';
const MEDIA_DIR = 'media';

const uid = (p: string) =>
  `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function trayRoot(): Directory {
  const d = new Directory(Paths.document, TRAY_DIR);
  if (!d.exists) d.create();
  return d;
}
function trayFile(): File {
  return new File(trayRoot(), TRAY_FILE);
}
function trayMedia(): Directory {
  const d = new Directory(trayRoot(), MEDIA_DIR);
  if (!d.exists) d.create();
  return d;
}

export function listTray(): TrayItem[] {
  try {
    const f = trayFile();
    if (!f.exists) return [];
    const arr = JSON.parse(f.textSync());
    return Array.isArray(arr) ? (arr as TrayItem[]) : [];
  } catch {
    return [];
  }
}

function writeTray(items: TrayItem[]): void {
  try {
    trayFile().write(JSON.stringify(items));
  } catch (e) {
    console.warn('No se pudo guardar la bandeja', e);
  }
}

function persistTrayMedia(srcUri: string): string {
  const ext = srcUri.split('?')[0].match(/\.(\w+)$/)?.[1] ?? 'dat';
  const dest = new File(trayMedia(), `${uid('m')}.${ext}`);
  new File(srcUri).copy(dest);
  return dest.uri;
}

function prepend(item: TrayItem): void {
  writeTray([item, ...listTray()]);
}

export function addTrayPhoto(srcUri: string): void {
  prepend({
    id: uid('t'),
    kind: 'photo',
    uri: persistTrayMedia(srcUri),
    createdAt: new Date().toISOString(),
  });
}

export function addTrayVideo(srcUri: string): void {
  prepend({
    id: uid('t'),
    kind: 'video',
    uri: persistTrayMedia(srcUri),
    createdAt: new Date().toISOString(),
  });
}

export function addTrayAudio(srcUri: string, durationMs: number): void {
  prepend({
    id: uid('t'),
    kind: 'audio',
    uri: persistTrayMedia(srcUri),
    durationMs,
    createdAt: new Date().toISOString(),
  });
}

export function addTrayText(text: string): void {
  prepend({
    id: uid('t'),
    kind: 'text',
    text,
    createdAt: new Date().toISOString(),
  });
}

export function removeTrayItem(id: string): void {
  writeTray(listTray().filter((i) => i.id !== id));
}

/**
 * Vuelca los items de la bandeja a una libreta. Si journalId es null, crea una
 * nueva. Devuelve el id de la libreta destino. Quita de la bandeja lo convertido.
 */
export function convertTrayToJournal(
  journalId: string | null,
  ids: string[],
  layout = 'collage',
  newTitle = 'Desde la bandeja'
): string | null {
  const journal = journalId ? loadJournal(journalId) : createJournal(newTitle);
  if (!journal) return null;

  const selected = listTray().filter((t) => ids.includes(t.id));
  const items: CanvasItem[] = selected.map((t, i) => {
    const base = {
      id: uid('it'),
      x: 36 + (i % 3) * 34,
      y: 110 + i * 44,
      scale: 1,
      rotation: i % 2 ? 0.05 : -0.05,
    };
    if (t.kind === 'photo') {
      return { ...base, kind: 'photo', uri: persistImage(journal.id, t.uri), frame: 'polaroid', width: 220, height: 280 };
    }
    if (t.kind === 'video') {
      return { ...base, kind: 'video', uri: persistImage(journal.id, t.uri), width: 220, height: 280 };
    }
    if (t.kind === 'audio') {
      return { ...base, kind: 'audio', uri: persistImage(journal.id, t.uri), durationMs: t.durationMs, width: 210, height: 64 };
    }
    return { ...base, kind: 'text', text: t.text, font: 'Caveat_700Bold', color: '#3B3A36', width: 240, height: 80 };
  });

  const arranged = applyLayout(items, layout);
  const pages = Array.isArray(journal.pages) ? [...journal.pages] : [];
  if (journalId && pages.length > 0) {
    // Libreta existente: lo convertido va en una página nueva al final.
    pages.push({
      id: uid('p'),
      background: { ...DEFAULT_BACKGROUND },
      items: arranged,
    });
  } else {
    // Libreta nueva (o sin páginas): va en la primera página.
    const first =
      pages[0] ?? { id: uid('p'), background: { ...DEFAULT_BACKGROUND }, items: [] };
    pages[0] = { ...first, items: arranged };
  }

  saveJournal({ ...journal, pages });
  writeTray(listTray().filter((t) => !ids.includes(t.id)));
  return journal.id;
}
