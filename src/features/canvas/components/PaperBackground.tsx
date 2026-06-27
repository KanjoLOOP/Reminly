import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import type { PaperPattern } from '../../../data/models/journal';

type Props = {
  color: string;
  pattern: PaperPattern;
};

const GAP = 34; // separación de líneas/cuadrícula
const LINE = 'rgba(59,58,54,0.10)'; // tinta cálida muy tenue

/**
 * Fondo del lienzo: color de papel + patrón opcional (cuadrícula o líneas tipo
 * hoja de libreta). Las líneas se dibujan con Views finas (sin dependencias).
 * No recibe toques (pointerEvents none).
 */
export function PaperBackground({ color, pattern }: Props) {
  const { width, height } = useWindowDimensions();

  const horizontals = useMemo(
    () => Array.from({ length: Math.ceil(height / GAP) }, (_, i) => (i + 1) * GAP),
    [height]
  );
  const verticals = useMemo(
    () => Array.from({ length: Math.ceil(width / GAP) }, (_, i) => (i + 1) * GAP),
    [width]
  );

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: color }]}
    >
      {(pattern === 'lines' || pattern === 'grid') &&
        horizontals.map((top) => (
          <View key={`h${top}`} style={[styles.hLine, { top }]} />
        ))}

      {pattern === 'grid' &&
        verticals.map((left) => (
          <View key={`v${left}`} style={[styles.vLine, { left }]} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth + 0.5,
    backgroundColor: LINE,
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth + 0.5,
    backgroundColor: LINE,
  },
});
