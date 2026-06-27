/**
 * Catálogo de cintas washi. Cada estilo define un color base y un patrón simple
 * dibujado con Views (sin imágenes). El usuario elige por cinta.
 */
export type WashiPattern = 'solid' | 'stripes' | 'dots';

export type WashiOption = {
  id: string;
  label: string;
  base: string;
  alt?: string;
  pattern: WashiPattern;
};

export const WASHI_OPTIONS: WashiOption[] = [
  { id: 'rose', label: 'Rosa', base: '#E8A598', pattern: 'solid' },
  { id: 'sage', label: 'Salvia', base: '#A7B9A0', pattern: 'solid' },
  { id: 'mustard', label: 'Mostaza', base: '#E9C46A', pattern: 'solid' },
  { id: 'sky', label: 'Cielo', base: '#9FC0D4', pattern: 'solid' },
  { id: 'lilac', label: 'Lila', base: '#C9B3D8', pattern: 'solid' },
  { id: 'kraft', label: 'Kraft', base: '#C9A77C', pattern: 'solid' },
  { id: 'stripes', label: 'Rayas', base: '#E8A598', alt: '#FBEAE5', pattern: 'stripes' },
  { id: 'dots', label: 'Topos', base: '#A7B9A0', alt: '#FFFFFF', pattern: 'dots' },
];

export const DEFAULT_WASHI = WASHI_OPTIONS[0];

export const getWashi = (id: string): WashiOption =>
  WASHI_OPTIONS.find((w) => w.id === id) ?? DEFAULT_WASHI;
