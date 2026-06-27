import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { FONT_OPTIONS } from '../../../core/theme/fonts';
import { colors, radius } from '../../../core/theme/tokens';

type Props = {
  value: string; // familia activa
  onSelect: (family: string) => void;
};

/**
 * Tira horizontal de tipografías. Cada opción se previsualiza con su propia
 * fuente, así el usuario ve cómo queda antes de aplicarla.
 */
export function FontPicker({ value, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {FONT_OPTIONS.map((f) => {
        const active = f.family === value;
        return (
          <Pressable
            key={f.id}
            onPress={() => onSelect(f.family)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text
              style={[
                styles.label,
                { fontFamily: f.family },
                active && styles.labelActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingHorizontal: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.paperLight,
    borderWidth: 1,
    borderColor: colors.kraftMuted,
  },
  chipActive: {
    backgroundColor: colors.rose,
    borderColor: colors.rose,
  },
  label: {
    fontSize: 22,
    color: colors.ink,
  },
  labelActive: {
    color: colors.white,
  },
});
