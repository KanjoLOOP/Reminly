import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radius } from '../../../core/theme/tokens';

type Props = {
  visible: boolean;
  value: string;
  onChangeText: (t: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

/**
 * Editor de texto en modal. Se abre al crear un texto nuevo o al pulsar "Editar"
 * sobre uno seleccionado. Mantenerlo fuera del lienzo evita conflictos entre el
 * cursor del TextInput y los gestos de arrastre/pinza.
 */
export function TextEditorModal({
  visible,
  value,
  onChangeText,
  onSave,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Editar texto</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder="Escribe algo…"
            placeholderTextColor={colors.inkFaint}
            autoFocus
            multiline
          />
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.ghost]} onPress={onCancel}>
              <Text style={styles.ghostText}>Cancelar</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.primary]} onPress={onSave}>
              <Text style={styles.primaryText}>Guardar</Text>
            </Pressable>
          </View>
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
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: colors.paperLight,
    borderRadius: radius.lg,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.kraftMuted,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    color: colors.ink,
    textAlignVertical: 'top',
    backgroundColor: colors.white,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: radius.pill,
  },
  ghost: {
    backgroundColor: colors.paperCream,
  },
  ghostText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  primary: {
    backgroundColor: colors.rose,
  },
  primaryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
