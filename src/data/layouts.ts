/**
 * Plantillas de colocación automática para convertir la bandeja en una página.
 * Estilos inspirados en collages / scrapbook. Cada layout reposiciona y escala
 * los elementos; el usuario luego puede moverlos a gusto.
 */
import type { CanvasItem } from './models/journal';

export const LAYOUT_OPTIONS: { id: string; label: string }[] = [
  { id: 'journal', label: 'Diario' },
  { id: 'collage', label: 'Collage' },
  { id: 'masonry', label: 'Mosaico' },
  { id: 'polaroid', label: 'Polaroids' },
  { id: 'destacado', label: 'Destacado' },
  { id: 'ola', label: 'Ola' },
  { id: 'tira', label: 'Tira' },
  { id: 'grid', label: 'Cuadrícula' },
  { id: 'column', label: 'Columna' },
];

// Ancho lógico de referencia del lienzo (px).
const CW = 360;

// Pseudoaleatorio determinista por índice (organico pero reproducible).
const rnd = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export function applyLayout(items: CanvasItem[], layout: string): CanvasItem[] {
  if (items.length === 0) return items;
  const n = items.length;

  // Diario: composición por tipos, mezclada, como un journaling real.
  if (layout === 'journal') {
    const media = items.filter((i) => i.kind === 'photo' || i.kind === 'video');
    const texts = items.filter((i) => i.kind === 'text');
    const stickers = items.filter((i) => i.kind === 'sticker');
    const washis = items.filter((i) => i.kind === 'washi');
    const audios = items.filter((i) => i.kind === 'audio');

    const out: CanvasItem[] = [];
    const boxes: { x: number; y: number; w: number; h: number }[] = [];

    // Fotos/vídeos: bloques escalonados y ligeramente girados.
    media.forEach((it, i) => {
      const s = Math.min(182 / it.width, 220 / it.height, 1);
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 18 + col * 150 + (rnd(i) * 24 - 12);
      const y = 70 + row * 152 + (rnd(i + 7) * 20 - 10);
      out.push({ ...it, x, y, scale: s, rotation: (rnd(i + 3) - 0.5) * 0.18 });
      boxes.push({ x, y, w: it.width * s, h: it.height * s });
    });

    // Washi: pegado sobre el borde superior de una foto.
    washis.forEach((it, i) => {
      const b = boxes[i % Math.max(1, boxes.length)];
      if (b) {
        const s = Math.min((b.w * 0.65) / it.width, 1);
        out.push({ ...it, x: b.x + b.w * 0.18, y: b.y - 10, scale: s, rotation: -0.08 + rnd(i) * 0.16 });
      } else {
        out.push({ ...it, x: 30 + i * 36, y: 90, scale: Math.min(160 / it.width, 1), rotation: -0.1 });
      }
    });

    // Texto: debajo o al lado de una foto.
    texts.forEach((it, i) => {
      const b = boxes.length ? boxes[(i + 1) % boxes.length] : null;
      const s = Math.min(200 / it.width, 1);
      if (b && i < boxes.length) {
        out.push({ ...it, x: Math.max(10, b.x - 6), y: b.y + b.h + 8, scale: s, rotation: (rnd(i) - 0.5) * 0.1 });
      } else {
        out.push({ ...it, x: 24, y: 90 + i * 72, scale: s, rotation: (rnd(i) - 0.5) * 0.1 });
      }
    });

    // Stickers: adornos pequeños en las esquinas de las fotos.
    stickers.forEach((it, i) => {
      const b = boxes[i % Math.max(1, boxes.length)];
      const s = Math.min(64 / it.width, 1);
      if (b) {
        const cx = i % 2 ? b.x + b.w - 26 : b.x - 14;
        const cy = i % 3 === 0 ? b.y - 18 : b.y + b.h - 26;
        out.push({ ...it, x: cx, y: cy, scale: s, rotation: (rnd(i) - 0.5) * 0.6 });
      } else {
        out.push({ ...it, x: 40 + i * 48, y: 130, scale: s, rotation: (rnd(i) - 0.5) * 0.6 });
      }
    });

    // Audios: tarjetas apiladas al final.
    let ay = (boxes.length ? Math.max(...boxes.map((b) => b.y + b.h)) : 200) + 18;
    audios.forEach((it) => {
      const s = Math.min(220 / it.width, 1);
      out.push({ ...it, x: 24, y: ay, scale: s, rotation: 0 });
      ay += it.height * s + 12;
    });

    return out;
  }

  // Mosaico tipo masonry: 2 columnas, cada elemento a la columna más corta.
  if (layout === 'masonry') {
    const colW = 162;
    const gap = 12;
    const x0 = 18;
    let yL = 70;
    let yR = 70;
    return items.map((it) => {
      const s = Math.min(colW / it.width, 1);
      const left = yL <= yR;
      const x = left ? x0 : x0 + colW + gap;
      const y = left ? yL : yR;
      const adv = it.height * s + gap;
      if (left) yL += adv;
      else yR += adv;
      return { ...it, x, y, scale: s, rotation: 0 };
    });
  }

  // Polaroids tirados: cluster con rotaciones fuertes y solape.
  if (layout === 'polaroid') {
    return items.map((it, i) => {
      const s = Math.min(168 / it.width, 196 / it.height, 1);
      const col = i % 2;
      const row = Math.floor(i / 2);
      return {
        ...it,
        x: 26 + col * 128 + (rnd(i) * 40 - 20),
        y: 76 + row * 116 + (rnd(i + 5) * 28 - 14),
        scale: s,
        rotation: (rnd(i + 2) - 0.5) * 0.52,
      };
    });
  }

  // Destacado: el primero grande arriba, el resto en rejilla pequeña debajo.
  if (layout === 'destacado') {
    const heroS = Math.min(300 / items[0].width, 1);
    const heroBottom = 64 + items[0].height * heroS + 24;
    return items.map((it, i) => {
      if (i === 0) {
        return {
          ...it,
          x: Math.max(8, (CW - it.width * heroS) / 2),
          y: 64,
          scale: heroS,
          rotation: -0.02,
        };
      }
      const k = i - 1;
      const col = k % 3;
      const row = Math.floor(k / 3);
      const s = Math.min(98 / it.width, 120 / it.height, 1);
      return {
        ...it,
        x: 16 + col * 112,
        y: heroBottom + row * 118,
        scale: s,
        rotation: (col - 1) * 0.05,
      };
    });
  }

  // Ola: los elementos siguen una curva sinusoidal.
  if (layout === 'ola') {
    return items.map((it, i) => {
      const s = Math.min(150 / it.width, 170 / it.height, 1);
      const t = n > 1 ? i / (n - 1) : 0;
      return {
        ...it,
        x: 16 + t * 205,
        y: 130 + Math.sin(t * Math.PI * 2) * 86 + i * 6,
        scale: s,
        rotation: Math.cos(t * Math.PI * 2) * 0.16,
      };
    });
  }

  // Tira de fotos: cascada diagonal solapada, como un carrete.
  if (layout === 'tira') {
    return items.map((it, i) => {
      const s = Math.min(150 / it.width, 1);
      return { ...it, x: 12 + i * 42, y: 68 + i * 78, scale: s, rotation: -0.1 };
    });
  }

  // Cuadrícula limpia de 2 columnas.
  if (layout === 'grid') {
    return items.map((it, i) => {
      const s = Math.min(150 / it.width, 175 / it.height, 1);
      const col = i % 2;
      const row = Math.floor(i / 2);
      return { ...it, x: 22 + col * 168, y: 90 + row * 195, scale: s, rotation: 0 };
    });
  }

  // Columna centrada.
  if (layout === 'column') {
    let y = 80;
    return items.map((it, i) => {
      const s = Math.min(230 / it.width, 1);
      const item = {
        ...it,
        x: Math.max(12, (CW - it.width * s) / 2),
        y,
        scale: s,
        rotation: i % 2 ? 0.025 : -0.025,
      };
      y += it.height * s + 26;
      return item;
    });
  }

  // Collage (por defecto): 2 columnas escalonadas, giradas y con jitter.
  return items.map((it, i) => {
    const s = Math.min(188 / it.width, 228 / it.height, 1);
    const col = i % 2;
    const row = Math.floor(i / 2);
    return {
      ...it,
      x: 14 + col * 152 + (rnd(i) * 22 - 11),
      y: 64 + row * 136 + (rnd(i + 9) * 18 - 9),
      scale: s,
      rotation: (rnd(i + 3) - 0.5) * 0.2,
    };
  });
}
