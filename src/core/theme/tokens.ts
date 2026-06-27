/**
 * Design tokens de Reminly.
 * Extraídos del mockup de Claude Design (docs/design/mockups/Reminly.html).
 * Fuente única de verdad para colores, sombras, radios, espaciado y tipografía.
 */

export const colors = {
  // Papel / superficies (cálidos)
  paper: '#FBF7F0',
  paperLight: '#FCFAF5',
  paperCream: '#F4EDE1',
  card: '#FCFAF5',

  // Kraft (fondos de lienzo / portadas)
  kraft: '#C9A77C',
  kraftLight: '#E3D4BA',
  kraftSoft: '#D9C7A8',
  kraftMuted: '#CBBFA6',

  // Tinta / texto
  ink: '#3B3A36', // principal (texto + base de sombras)
  inkStrong: '#211F1B',
  inkMuted: '#9A8F7D', // texto secundario
  inkFaint: '#B6A98F', // texto terciario / metadatos

  // Acentos
  rose: '#E8A598', // acento primario
  roseDeep: '#D98A73',
  roseTint: '#FBEAE5',
  sage: '#A7B9A0',
  mustard: '#E9C46A',

  // Utilidad
  white: '#FFFFFF',
} as const;

/**
 * Sombras CÁLIDAS (no negras). En React Native se aplican con
 * shadowColor + shadowOffset + shadowOpacity + shadowRadius (iOS) y elevation (Android).
 * Aquí se documentan los valores del diseño; el helper de conversión vivirá en shadow.ts.
 */
export const shadows = {
  // 0 2px 6px rgba(59,58,54,.08)
  sm: { color: colors.ink, offsetY: 2, blur: 6, opacity: 0.08 },
  // 0 3px 7px rgba(59,58,54,.18)
  md: { color: colors.ink, offsetY: 3, blur: 7, opacity: 0.18 },
  // 0 14px 30px rgba(59,58,54,.22)
  lg: { color: colors.ink, offsetY: 14, blur: 30, opacity: 0.22 },
  // sheets/modales: 0 -12px 40px rgba(59,58,54,.3)
  sheet: { color: colors.ink, offsetY: -12, blur: 40, opacity: 0.3 },
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
  sheet: 28, // esquinas superiores del bottom sheet
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const typography = {
  // Manuscrita: títulos del journal y contenido escrito a mano (cargada con expo-font)
  handwriting: 'Caveat_400Regular',
  handwritingBold: 'Caveat_700Bold',
  // Sans redondeada para la UI (pendiente de cargar: Nunito)
  ui: 'Nunito',
  sizes: {
    caption: 12,
    body: 15,
    title: 20,
    display: 32, // entradas manuscritas grandes
  },
} as const;

export const theme = { colors, shadows, radius, spacing, typography } as const;
export type Theme = typeof theme;
