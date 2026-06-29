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
  // Sólidos
  { id: 'rose', label: 'Rosa', base: '#E8A598', pattern: 'solid' },
  { id: 'terra', label: 'Terracota', base: '#D98A73', pattern: 'solid' },
  { id: 'sage', label: 'Salvia', base: '#A7B9A0', pattern: 'solid' },
  { id: 'forest', label: 'Bosque', base: '#4F6B57', pattern: 'solid' },
  { id: 'mustard', label: 'Mostaza', base: '#E9C46A', pattern: 'solid' },
  { id: 'amber', label: 'Ámbar', base: '#E0A458', pattern: 'solid' },
  { id: 'sky', label: 'Cielo', base: '#9FC0D4', pattern: 'solid' },
  { id: 'blue', label: 'Azul', base: '#6E9FBE', pattern: 'solid' },
  { id: 'lilac', label: 'Lila', base: '#C9B3D8', pattern: 'solid' },
  { id: 'plum', label: 'Ciruela', base: '#A87FB8', pattern: 'solid' },
  { id: 'kraft', label: 'Kraft', base: '#C9A77C', pattern: 'solid' },
  { id: 'ink', label: 'Tinta', base: '#3B3A36', pattern: 'solid' },
  // Rayas
  { id: 'stripes-rose', label: 'Rayas rosa', base: '#E8A598', alt: '#FBEAE5', pattern: 'stripes' },
  { id: 'stripes-sage', label: 'Rayas verde', base: '#A7B9A0', alt: '#E9EFE6', pattern: 'stripes' },
  { id: 'stripes-blue', label: 'Rayas azul', base: '#9FC0D4', alt: '#E6EEF2', pattern: 'stripes' },
  // Topos
  { id: 'dots-sage', label: 'Topos verde', base: '#A7B9A0', alt: '#FFFFFF', pattern: 'dots' },
  { id: 'dots-mustard', label: 'Topos miel', base: '#E9C46A', alt: '#3B3A36', pattern: 'dots' },
  { id: 'dots-ink', label: 'Topos tinta', base: '#3B3A36', alt: '#FBF7F0', pattern: 'dots' },
];

export const DEFAULT_WASHI = WASHI_OPTIONS[0];

export const getWashi = (id: string): WashiOption =>
  WASHI_OPTIONS.find((w) => w.id === id) ?? DEFAULT_WASHI;
