/**
 * Catálogo de fuentes manuscritas/decorativas de Reminly.
 * - `fontAssets` se pasa a `useFonts` en el layout raíz para cargarlas.
 * - `FONT_OPTIONS` alimenta el selector de tipografía.
 *
 * Para añadir una fuente nueva: instala su paquete `@expo-google-fonts/<nombre>`,
 * impórtala aquí, añádela a `fontAssets` y a `FONT_OPTIONS`.
 */
import { AmaticSC_400Regular, AmaticSC_700Bold } from '@expo-google-fonts/amatic-sc';
import { Caveat_400Regular, Caveat_700Bold } from '@expo-google-fonts/caveat';
import {
  DancingScript_400Regular,
  DancingScript_700Bold,
} from '@expo-google-fonts/dancing-script';
import { IndieFlower_400Regular } from '@expo-google-fonts/indie-flower';
import { Kalam_400Regular, Kalam_700Bold } from '@expo-google-fonts/kalam';
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { Satisfy_400Regular } from '@expo-google-fonts/satisfy';
import { ShadowsIntoLight_400Regular } from '@expo-google-fonts/shadows-into-light';

/** Objeto que se pasa a useFonts() para registrar todas las familias. */
export const fontAssets = {
  Caveat_400Regular,
  Caveat_700Bold,
  DancingScript_400Regular,
  DancingScript_700Bold,
  PatrickHand_400Regular,
  ShadowsIntoLight_400Regular,
  IndieFlower_400Regular,
  Kalam_400Regular,
  Kalam_700Bold,
  Satisfy_400Regular,
  AmaticSC_400Regular,
  AmaticSC_700Bold,
};

export type FontOption = {
  id: string;
  label: string;
  /** Nombre de familia registrado, el que se usa en fontFamily. */
  family: string;
};

/** Orden en el que aparecen en el selector. La primera es la predeterminada. */
export const FONT_OPTIONS: FontOption[] = [
  { id: 'caveat', label: 'Caveat', family: 'Caveat_700Bold' },
  { id: 'dancing', label: 'Dancing', family: 'DancingScript_700Bold' },
  { id: 'satisfy', label: 'Satisfy', family: 'Satisfy_400Regular' },
  { id: 'patrick', label: 'Patrick', family: 'PatrickHand_400Regular' },
  { id: 'shadows', label: 'Shadows', family: 'ShadowsIntoLight_400Regular' },
  { id: 'indie', label: 'Indie', family: 'IndieFlower_400Regular' },
  { id: 'kalam', label: 'Kalam', family: 'Kalam_700Bold' },
  { id: 'amatic', label: 'Amatic', family: 'AmaticSC_700Bold' },
];

export const DEFAULT_FONT = FONT_OPTIONS[0];
