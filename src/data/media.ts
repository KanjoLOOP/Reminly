/**
 * Procesado de imágenes antes de guardarlas.
 *
 * - Re-codifica a JPEG con compresión → reduce mucho el peso (almacenamiento y
 *   tamaño de los export `.reminly`) y mejora el rendimiento del lienzo.
 * - Al re-codificar se **eliminan los metadatos EXIF** (incluida la
 *   geolocalización), lo que mejora la privacidad: las fotos no llevan dónde se
 *   tomaron al compartir una libreta.
 * - Los GIF NO se tocan (se perdería la animación).
 */
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const MAX_DIM = 1600;

export function isGif(uri: string, mimeType?: string | null): boolean {
  if (mimeType && mimeType.toLowerCase().includes('gif')) return true;
  return uri.split('?')[0].toLowerCase().endsWith('.gif');
}

/**
 * Devuelve la uri de una versión comprimida y sin EXIF de la imagen.
 * Si es GIF o algo falla, devuelve la uri original.
 */
export async function processPhoto(
  uri: string,
  opts: { gif?: boolean; width?: number } = {}
): Promise<string> {
  if (opts.gif) return uri;
  try {
    const context = ImageManipulator.manipulate(uri);
    if (opts.width && opts.width > MAX_DIM) {
      context.resize({ width: MAX_DIM });
    }
    const rendered = await context.renderAsync();
    const result = await rendered.saveAsync({
      compress: 0.72,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  } catch {
    return uri;
  }
}
