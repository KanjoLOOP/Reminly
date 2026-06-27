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
  updatedAt: string;
  items: CanvasItem[];
};
