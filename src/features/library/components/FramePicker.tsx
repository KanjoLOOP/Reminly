import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FRAME_OPTIONS } from '../data/frames';
import { colors, radius } from '../../../core/theme/tokens';

type Props = {
  value: string; // id de marco activo
  onSelect: (id: string) => void;
};

/** Tira horizontal de marcos de foto, con una miniatura del estilo. */
export function FramePicker({ value, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {FRAME_OPTIONS.map((f) => {
        const active = f.id === value;
        return (
          <Pressable
            key={f.id}
            onPress={() => onSelect(f.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <View style={[styles.preview, f.container]}>
              <View
                style={[styles.previewImg, { borderRadius: f.imageRadius }]}
              />
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>
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
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.paperLight,
    borderWidth: 1,
    borderColor: colors.kraftMuted,
    gap: 4,
  },
  chipActive: {
    borderColor: colors.rose,
    borderWidth: 2,
  },
  preview: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImg: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.kraftLight,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
  },
  labelActive: {
    color: colors.rose,
  },
});
