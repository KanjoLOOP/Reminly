import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../../../core/theme/tokens';

type Props = {
  uri: string;
  durationMs: number;
};

function fmt(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Alturas fijas para una "onda" decorativa.
const BARS = [10, 18, 8, 22, 14, 26, 12, 20, 9, 16, 24, 11];

/** Nota de voz: tarjeta de papel con botón play/pausa y duración. */
export function AudioNote({ uri, durationMs }: Props) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const playing =
    (status as any)?.playing ?? (status as any)?.isPlaying ?? false;

  const toggle = () => {
    if (playing) {
      player.pause();
    } else {
      try {
        player.seekTo(0);
      } catch {
        // algunos estados no permiten seek; se ignora
      }
      player.play();
    }
  };

  return (
    <View style={styles.card}>
      <Pressable style={styles.playBtn} onPress={toggle} hitSlop={8}>
        <Text style={styles.icon}>{playing ? '❚❚' : '►'}</Text>
      </Pressable>

      <View style={styles.wave}>
        {BARS.map((h, i) => (
          <View key={i} style={[styles.bar, { height: h }]} />
        ))}
      </View>

      <Text style={styles.time}>{fmt(durationMs)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paperLight,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 28,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.kraft,
  },
  time: {
    fontSize: 13,
    color: colors.inkMuted,
    fontWeight: '600',
    minWidth: 34,
    textAlign: 'right',
  },
});
