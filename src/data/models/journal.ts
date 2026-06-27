/**
 * Modelo de dominio del journal. Es lo que se serializa a journal.json.
 * Ver docs/03-modelo-datos.md.
 */

export const SCHEMA_VERSION = 1;

/** Transformación de un elemento sobre el lienzo. rotation en radianes. */
export type Transform = {
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

type BaseItem = Transform & {
  id: string;
  /** Tamaño base de la caja del elemento. En texto, width = ancho de ajuste. */
  width: number;
  height: number;
};

export type PhotoItem = BaseItem & {
  kind: 'photo';
  /** URI local (documentDirectory/media/...) o remota. */
  uri: string;
  /** Estilo de marco (ver features/library/data/frames.ts). */
  frame: string;
};

export type TextItem = BaseItem & {
  kind: 'text';
  text: string;
  /** Familia de fuente registrada (ver core/theme/fonts.ts). */
  font: string;
};

export type StickerItem = BaseItem & {
  kind: 'sticker';
  /** Emoji o glifo del sticker. */
  emoji: string;
};

export type CanvasItem = PhotoItem | TextItem | StickerItem;

/** Patrón del papel del lienzo. */
export type PaperPattern = 'blank' | 'grid' | 'lines';

export type PaperBackground = {
  color: string;
  pattern: PaperPattern;
};

export const DEFAULT_BACKGROUND: PaperBackground = {
  color: '#FBF7F0',
  pattern: 'blank',
};

export type Journal = {
  schemaVersion: number;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  background: PaperBackground;
  items: CanvasItem[];
};

/** Versión ligera para la estantería (home), sin cargar todos los elementos. */
export type JournalSummary = {
  id: string;
  title: string;
  updatedAt: string;
  coverUri?: string;
  count: number;
};
