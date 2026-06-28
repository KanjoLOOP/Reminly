import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../../core/theme/tokens';
import type { CoverStyle } from '../../../data/models/journal';

type Props = {
  color: string;
  style: CoverStyle;
  title: string;
  coverUri?: string;
  height?: number;
};

/** Elige texto claro u oscuro según la luminancia del color de tapa. */
function textOn(hex: string): string {
  const c = hex.replace('#', '');
  if (c.length < 6) return colors.ink;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? '#3B3A36' : '#FFFFFF';
}

/** Dibuja la portada de una libreta según su estilo (libreta, anillas, libro). */
export function NotebookCover({ color, style, title, coverUri, height = 200 }: Props) {
  const ink = textOn(color);
  const dim = ink === '#FFFFFF' ? 'rgba(255,255,255,0.85)' : 'rgba(59,58,54,0.75)';

  const taped = coverUri && style !== 'book' && (
    <View style={styles.tapedPhoto}>
      <View style={styles.washiTape} />
      <Image source={{ uri: coverUri }} style={styles.coverImg} />
    </View>
  );

  return (
    <View style={[styles.cover, { backgroundColor: color, height }]}>
      {/* Encuadernación según estilo */}
      {style === 'notebook' && <View style={styles.spine} />}
      {style === 'book' && <View style={styles.bookSpine} />}
      {style === 'spiral' && (
        <View style={styles.rings}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={styles.ring} />
          ))}
        </View>
      )}

      {style === 'book' ? (
        <View style={styles.plateWrap}>
          <View style={[styles.plate, { borderColor: dim }]}>
            <Text
              style={[styles.bookTitle, { color: ink }]}
              numberOfLines={3}
            >
              {title}
            </Text>
          </View>
        </View>
      ) : (
        <>
          {taped}
          <Text style={[styles.title, { color: ink }]} numberOfLines={2}>
            {title}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    borderRadius: 10,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    paddingTop: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: 'rgba(33,31,27,0.16)',
  },
  bookSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'rgba(33,31,27,0.30)',
  },
  rings: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    zIndex: 3,
  },
  ring: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(250,247,240,0.9)',
    borderWidth: 2,
    borderColor: 'rgba(33,31,27,0.35)',
  },
  tapedPhoto: {
    marginTop: 10,
    padding: 6,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 3,
    transform: [{ rotate: '-3deg' }],
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  washiTape: {
    position: 'absolute',
    top: -7,
    alignSelf: 'center',
    width: 46,
    height: 16,
    backgroundColor: 'rgba(232,165,152,0.85)',
    transform: [{ rotate: '4deg' }],
    borderRadius: 2,
    zIndex: 2,
  },
  coverImg: {
    width: 86,
    height: 86,
    borderRadius: 2,
    backgroundColor: colors.kraftLight,
  },
  title: {
    marginTop: 'auto',
    marginBottom: 14,
    fontSize: 26,
    lineHeight: 28,
    textAlign: 'center',
    fontFamily: typography.handwritingBold,
  },
  plateWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  plate: {
    width: '78%',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 24,
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: typography.handwritingBold,
  },
});
