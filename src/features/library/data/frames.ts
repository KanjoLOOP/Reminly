import type { ViewStyle } from 'react-native';

import { colors } from '../../../core/theme/tokens';

/**
 * Catálogo de marcos de foto. Cada marco define el estilo del contenedor que
 * envuelve la imagen. El usuario elige por foto (como con las fuentes).
 */
export type FrameOption = {
  id: string;
  label: string;
  /** Estilo del contenedor (marco). */
  container: ViewStyle;
  /** Radio de la imagen interior. */
  imageRadius: number;
};

export const FRAME_OPTIONS: FrameOption[] = [
  {
    id: 'polaroid',
    label: 'Polaroid',
    container: {
      backgroundColor: colors.white,
      padding: 8,
      paddingBottom: 24,
      borderRadius: 4,
    },
    imageRadius: 2,
  },
  {
    id: 'simple',
    label: 'Simple',
    container: {
      backgroundColor: colors.white,
      padding: 6,
      borderRadius: 4,
    },
    imageRadius: 2,
  },
  {
    id: 'rounded',
    label: 'Redondo',
    container: {
      backgroundColor: colors.white,
      padding: 6,
      borderRadius: 20,
    },
    imageRadius: 15,
  },
  {
    id: 'kraft',
    label: 'Kraft',
    container: {
      backgroundColor: colors.kraft,
      padding: 9,
      borderRadius: 4,
    },
    imageRadius: 2,
  },
  {
    id: 'clean',
    label: 'Sin marco',
    container: {
      padding: 0,
      borderRadius: 10,
    },
    imageRadius: 10,
  },
  {
    id: 'dashed',
    label: 'Recortable',
    container: {
      backgroundColor: colors.paperLight,
      padding: 8,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.kraftMuted,
      borderStyle: 'dashed',
    },
    imageRadius: 2,
  },
];

export const DEFAULT_FRAME = FRAME_OPTIONS[0];

export const getFrame = (id: string): FrameOption =>
  FRAME_OPTIONS.find((f) => f.id === id) ?? DEFAULT_FRAME;
