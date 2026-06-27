/**
 * Persistencia local del journal con la API de expo-file-system (SDK 54+):
 * clases File/Directory y constantes Paths. Operaciones síncronas.
 *
 * Nota: por ahora un único journal en la raíz de documentos. Cuando haya varios
 * journals se pasará a la estructura por carpetas de docs/03-modelo-datos.md.
 */
import { Directory, File, Paths } from 'expo-file-system';

import {
  CanvasItem,
  Journal,
  SCHEMA_VERSION,
} from '../models/journal';

const JOURNAL_FILE = 'journal.json';
const MEDIA_DIR = 'media';

/** Lee el journal guardado. Devuelve null si no existe o está corrupto. */
export function loadJournal(): Journal | null {
  try {
    const file = new File(Paths.document, JOURNAL_FILE);
    if (!file.exists) return null;
    const parsed = JSON.parse(file.textSync()) as Journal;
    if (!parsed || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Guarda los elementos del lienzo (sobrescribe el journal). */
export function saveJournal(items: CanvasItem[]): void {
  try {
    const journal: Journal = {
      schemaVersion: SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      items,
    };
    const file = new File(Paths.document, JOURNAL_FILE);
    file.write(JSON.stringify(journal));
  } catch (e) {
    console.warn('No se pudo guardar el journal', e);
  }
}

/**
 * Copia una imagen elegida (uri temporal) a documentDirectory/media y devuelve
 * la uri persistente. Si algo falla, devuelve la uri original como fallback.
 */
export function persistImage(srcUri: string): string {
  try {
    const mediaDir = new Directory(Paths.document, MEDIA_DIR);
    if (!mediaDir.exists) mediaDir.create();

    const cleanUri = srcUri.split('?')[0];
    const extMatch = cleanUri.match(/\.(\w+)$/);
    const ext = extMatch ? extMatch[1] : 'jpg';
    const name = `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const src = new File(srcUri);
    const dest = new File(mediaDir, name);
    src.copy(dest);
    return dest.uri;
  } catch (e) {
    console.warn('No se pudo copiar la imagen a media/, se usa la uri original', e);
    return srcUri;
  }
}
