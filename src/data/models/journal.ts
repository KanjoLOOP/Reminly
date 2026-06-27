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

type BaseItem = Transform & { id: string };

export type PhotoItem = BaseItem & {
  kind: 'photo';
  /** URI local (documentDirectory/media/...) o remota. */
  uri: string;
};

export type TextItem = BaseItem & {
  kind: 'text';
  text: string;
  /** Familia de fuente registrada (ver core/theme/fonts.ts). */
  font: string;
};

export type CanvasItem = PhotoItem | TextItem;

export type Journal = {
  schemaVersion: number;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
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
