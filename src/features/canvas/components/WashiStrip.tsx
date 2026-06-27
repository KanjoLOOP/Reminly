import { StyleSheet, View } from 'react-native';

import { getWashi } from '../../library/data/washi';

type Props = {
  style: string; // id de washi
  height: number;
};

/**
 * Cinta washi: tira translúcida con color/patrón. Rellena el ancho de su caja
 * (la longitud se ajusta con el tirador) y tiene altura fija (ancho de cinta).
 */
export function WashiStrip({ style, height }: Props) {
  const w = getWashi(style);

  return (
    <View style={[styles.tape, { height }]}>
      {w.pattern === 'solid' && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: w.base }]} />
      )}

      {w.pattern === 'stripes' && (
        <View style={[StyleSheet.absoluteFill, styles.row]}>
          {Array.from({ length: 14 }).map((_, i) => (
            <View
              key={i}
              style={{ flex: 1, backgroundColor: i % 2 === 0 ? w.base : w.alt }}
            />
          ))}
        </View>
      )}

      {w.pattern === 'dots' && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: w.base }]}>
          <View style={[StyleSheet.absoluteFill, styles.dotsRow]}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: w.alt }]} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tape: {
    width: '100%',
    opacity: 0.9,
    borderRadius: 2,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.9,
  },
});
