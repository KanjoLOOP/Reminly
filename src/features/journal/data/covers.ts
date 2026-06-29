import { PALETTE } from '../../../core/theme/palette';
import type { CoverStyle } from '../../../data/models/journal';

/** Tipos de libreta disponibles. */
export const COVER_STYLES: { id: CoverStyle; label: string }[] = [
  { id: 'notebook', label: 'Libreta' },
  { id: 'spiral', label: 'Anillas' },
  { id: 'book', label: 'Libro' },
];

/** Colores de tapa (paleta compartida). */
export const COVER_COLORS = PALETTE;
