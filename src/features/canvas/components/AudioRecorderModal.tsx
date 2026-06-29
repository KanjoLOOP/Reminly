import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../../../core/theme/tokens';

type Props = {
  visible: boolean;
  onSave: (uri: string, durationMs: number) => void;
  onCancel: () => void;
};

function fmt(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function AudioRecorderModal({ visible, onSave, onCancel }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = async () => {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        onCancel();
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setSeconds(0);
      setRecording(true);
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      onCancel();
    }
  };

  const stop = async () => {
    if (timer.current) clearInterval(timer.current);
    setRecording(false);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (uri) onSave(uri, seconds * 1000);
      else onCancel();
    } catch {
      onCancel();
    }
  };

  const cancel = () => {
    if (timer.current) clearInterval(timer.current);
    if (recording) recorder.stop().catch(() => {});
    setRecording(false);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Nota de voz</Text>
          <Text style={styles.timer}>{fmt(seconds)}</Text>

          <Pressable
            style={[styles.recBtn, recording && styles.recBtnActive]}
            onPress={recording ? stop : start}
          >
            <View style={recording ? styles.stopIcon : styles.recIcon} />
          </Pressable>

          <Text style={styles.hint}>
            {recording ? 'Toca para detener y guardar' : 'Toca para grabar'}
          </Text>

          <Pressable style={styles.cancel} onPress={cancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(33,31,27,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  card: {
    backgroundColor: colors.paperLight,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  timer: {
    fontSize: 34,
    fontWeight: '300',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  recBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.roseTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.rose,
  },
  recBtnActive: {
    backgroundColor: colors.rose,
  },
  recIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.rose,
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  hint: {
    fontSize: 13,
    color: colors.inkMuted,
  },
  cancel: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.inkMuted,
  },
});
