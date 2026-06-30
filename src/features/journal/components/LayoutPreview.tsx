import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../../../core/theme/tokens';
import { applyLayout } from '../../../data/layouts';
import type { CanvasItem } from '../../../data/models/journal';

// Ancho lógico de referencia que usa applyLayout.
const REF_W = 360;

// Mezcla de ejemplo (fotos, texto, sticker, washi) para previsualizar.
const DUMMY: CanvasItem[] = [
  { id: 'd1', kind: 'photo', uri: '', frame: 'polaroid', x: 0, y: 0, scale: 1, rotation: 0, width: 220, height: 280 },
  { id: 'd2', kind: 'photo', uri: '', frame: 'polaroid', x: 0, y: 0, scale: 1, rotation: 0, width: 250, height: 180 },
  { id: 'd3', kind: 'text', text: '', font: 'Caveat_700Bold', color: '#3B3A36', x: 0, y: 0, scale: 1, rotation: 0, width: 220, height: 56 },
  { id: 'd4', kind: 'photo', uri: '', frame: 'polaroid', x: 0, y: 0, scale: 1, rotation: 0, width: 200, height: 210 },
  { id: 'd5', kind: 'sticker', emoji: '', x: 0, y: 0, scale: 1, rotation: 0, width: 90, height: 90 },
  { id: 'd6', kind: 'washi', style: 'rose', x: 0, y: 0, scale: 1, rotation: 0, width: 170, height: 34 },
  { id: 'd7', kind: 'photo', uri: '', frame: 'polaroid', x: 0, y: 0, scale: 1, rotation: 0, width: 230, height: 170 },
];

function colorFor(kind: string): string {
  switch (kind) {
    case 'photo':
      return colors.kraftLight;
    case 'video':
      return colors.ink;
    case 'text':
      return colors.inkFaint;
    case 'sticker':
      return colors.rose;
    case 'washi':
      return colors.sage;
    default:
      return colors.kraftMuted;
  }
}

type Props = { layoutId: string; width?: number; height?: number };

export function LayoutPreview({ layoutId, width = 78, height = 104 }: Props) {
  const s = width / REF_W;
  const placed = useMemo(() => applyLayout(DUMMY, layoutId), [layoutId]);

  return (
    <View style={[styles.box, { width, height }]}>
      {placed.map((it) => {
        const w = Math.max(3, it.width * it.scale * s);
        const h =
          it.kind === 'text'
            ? 6
            : it.kind === 'sticker'
              ? w
              : Math.max(3, it.height * it.scale * s);
        return (
          <View
            key={it.id}
            style={{
              position: 'absolute',
              left: it.x * s,
              top: it.y * s - 10,
              width: w,
              height: h,
              borderRadius: it.kind === 'sticker' ? w / 2 : 2,
              backgroundColor: colorFor(it.kind),
              transform: [{ rotate: `${it.rotation}rad` }],
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.paper,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.kraftMuted,
  },
});
