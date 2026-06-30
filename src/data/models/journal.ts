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
  /** Color del texto. */
  color: string;
};

export type StickerItem = BaseItem & {
  kind: 'sticker';
  /** Emoji o glifo del sticker. */
  emoji: string;
};

export type WashiItem = BaseItem & {
  kind: 'washi';
  /** Estilo de cinta (ver features/library/data/washi.ts). */
  style: string;
};

export type AudioItem = BaseItem & {
  kind: 'audio';
  /** URI local del audio grabado. */
  uri: string;
  /** Duración en milisegundos. */
  durationMs: number;
};

export type VideoItem = BaseItem & {
  kind: 'video';
  /** URI local del vídeo. */
  uri: string;
};

export type CanvasItem =
  | PhotoItem
  | TextItem
  | StickerItem
  | WashiItem
  | AudioItem
  | VideoItem;

/** Patrón del papel del lienzo. */
export type PaperPattern = 'blank' | 'grid' | 'lines';

export type PaperBackground = {
  color: string;
  pattern: PaperPattern;
  /** Color de la cuadrícula/líneas. */
  lineColor: string;
};

export const DEFAULT_BACKGROUND: PaperBackground = {
  color: '#FBF7F0',
  pattern: 'blank',
  lineColor: '#3B3A36',
};

/** Estilo de tapa de la libreta en la estantería. */
export type CoverStyle = 'notebook' | 'spiral' | 'book';

export type Cover = {
  color: string;
  style: CoverStyle;
};

export const DEFAULT_COVER: Cover = {
  color: '#C9A77C',
  style: 'notebook',
};

/** Una hoja de la libreta: su propio papel y sus elementos. */
export type Page = {
  id: string;
  background: PaperBackground;
  items: CanvasItem[];
};

export type Journal = {
  schemaVersion: number;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  cover: Cover;
  pages: Page[];
};

/** Versión ligera para la estantería (home), sin cargar todos los elementos. */
export type JournalSummary = {
  id: string;
  title: string;
  updatedAt: string;
  coverUri?: string;
  coverColor: string;
  coverStyle: CoverStyle;
  count: number;
};
