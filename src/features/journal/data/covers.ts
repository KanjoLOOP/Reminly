import type { CoverStyle } from '../../../data/models/journal';

/** Tipos de libreta disponibles. */
export const COVER_STYLES: { id: CoverStyle; label: string }[] = [
  { id: 'notebook', label: 'Libreta' },
  { id: 'spiral', label: 'Anillas' },
  { id: 'book', label: 'Libro' },
];

/** Paleta de colores de tapa (cálidos + algún tono fuerte). */
export const COVER_COLORS = [
  '#C9A77C', // kraft
  '#E8A598', // rosa
  '#A7B9A0', // salvia
  '#E9C46A', // mostaza
  '#9FC0D4', // azul
  '#C9B3D8', // lila
  '#D98A73', // terracota
  '#6E7F74', // verde profundo
  '#3B3A36', // carbón
  '#FBF7F0', // crema
];
