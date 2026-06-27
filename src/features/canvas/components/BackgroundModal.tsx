import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radius } from '../../../core/theme/tokens';
import type { PaperPattern } from '../../../data/models/journal';

type Props = {
  visible: boolean;
  color: string;
  pattern: PaperPattern;
  onChange: (next: { color: string; pattern: PaperPattern }) => void;
  onClose: () => void;
};

// Paleta de papeles cálidos.
const PAPER_COLORS = [
  '#FBF7F0',
  '#F4EDE1',
  '#EFE7D6',
  '#FBEAE5',
  '#E9EFE6',
  '#E6EEF2',
  '#F0E9F2',
  '#FFFFFF',
];

const PATTERNS: { id: PaperPattern; label: string }[] = [
  { id: 'blank', label: 'Liso' },
  { id: 'grid', label: 'Cuadrícula' },
  { id: 'lines', label: 'Líneas' },
];

export function BackgroundModal({
  visible,
  color,
  pattern,
  onChange,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Fondo del papel</Text>

          <Text style={styles.label}>Color</Text>
          <View style={styles.swatches}>
            {PAPER_COLORS.map((c) => {
              const active = c.toLowerCase() === color.toLowerCase();
              return (
                <Pressable
                  key={c}
                  onPress={() => onChange({ color: c, pattern })}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    active && styles.swatchActive,
                  ]}
                />
              );
            })}
          </View>

          <Text style={styles.label}>Estilo</Text>
          <View style={styles.patterns}>
            {PATTERNS.map((p) => {
              const active = p.id === pattern;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => onChange({ color, pattern: p.id })}
                  style={[styles.patternBtn, active && styles.patternActive]}
                >
                  <Text style={[styles.patternText, active && styles.patternTextActive]}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.done} onPress={onClose}>
            <Text style={styles.doneText}>Listo</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(33,31,27,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.paperLight,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    padding: 22,
    paddingBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkMuted,
    marginTop: 6,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.kraftMuted,
  },
  swatchActive: {
    borderWidth: 3,
    borderColor: colors.rose,
  },
  patterns: {
    flexDirection: 'row',
    gap: 10,
  },
  patternBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.paperCream,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.kraftMuted,
  },
  patternActive: {
    backgroundColor: colors.rose,
    borderColor: colors.rose,
  },
  patternText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  patternTextActive: {
    color: colors.white,
  },
  done: {
    marginTop: 10,
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
