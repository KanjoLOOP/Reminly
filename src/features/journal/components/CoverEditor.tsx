import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '../../../core/theme/tokens';
import type { CoverStyle } from '../../../data/models/journal';
import { COVER_COLORS, COVER_STYLES } from '../data/covers';
import { NotebookCover } from './NotebookCover';

type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  initialColor: string;
  initialStyle: CoverStyle;
  title: string;
  coverUri?: string;
  onConfirm: (color: string, style: CoverStyle) => void;
  onClose: () => void;
  onDelete?: () => void;
  onExport?: () => void;
};

export function CoverEditor({
  visible,
  mode,
  initialColor,
  initialStyle,
  title,
  coverUri,
  onConfirm,
  onClose,
  onDelete,
  onExport,
}: Props) {
  const [color, setColor] = useState(initialColor);
  const [style, setStyle] = useState<CoverStyle>(initialStyle);

  useEffect(() => {
    if (visible) {
      setColor(initialColor);
      setStyle(initialStyle);
    }
  }, [visible, initialColor, initialStyle]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabber} />
          <Text style={styles.title}>
            {mode === 'create' ? 'Nueva libreta' : 'Editar portada'}
          </Text>

          {/* Vista previa en vivo */}
          <View style={styles.previewWrap}>
            <View style={styles.previewBook}>
              <NotebookCover
                color={color}
                style={style}
                title={title}
                coverUri={coverUri}
                height={150}
              />
            </View>
          </View>

          <Text style={styles.label}>Tipo</Text>
          <View style={styles.styles}>
            {COVER_STYLES.map((s) => {
              const active = s.id === style;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setStyle(s.id)}
                  style={[styles.styleBtn, active && styles.styleActive]}
                >
                  <Text style={[styles.styleText, active && styles.styleTextActive]}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Color</Text>
          <View style={styles.swatches}>
            {COVER_COLORS.map((c) => {
              const active = c.toLowerCase() === color.toLowerCase();
              return (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    active && styles.swatchActive,
                  ]}
                />
              );
            })}
          </View>

          <Pressable style={styles.confirm} onPress={() => onConfirm(color, style)}>
            <Text style={styles.confirmText}>
              {mode === 'create' ? 'Crear libreta' : 'Guardar'}
            </Text>
          </Pressable>

          {mode === 'edit' && onExport && (
            <Pressable style={styles.export} onPress={onExport}>
              <Text style={styles.exportText}>Exportar / Compartir</Text>
            </Pressable>
          )}

          {mode === 'edit' && onDelete && (
            <Pressable style={styles.delete} onPress={onDelete}>
              <Text style={styles.deleteText}>Borrar libreta</Text>
            </Pressable>
          )}
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
  sheet: {
    backgroundColor: colors.paperLight,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.kraftMuted,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  previewWrap: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  previewBook: {
    width: 120,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkMuted,
    marginTop: 4,
  },
  styles: {
    flexDirection: 'row',
    gap: 10,
  },
  styleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.paperCream,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.kraftMuted,
  },
  styleActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  styleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  styleTextActive: {
    color: colors.white,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.kraftMuted,
  },
  swatchActive: {
    borderWidth: 3,
    borderColor: colors.rose,
  },
  confirm: {
    marginTop: 10,
    backgroundColor: colors.rose,
    borderRadius: radius.pill,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  export: {
    alignItems: 'center',
    paddingVertical: 13,
    backgroundColor: colors.paperCream,
    borderRadius: radius.pill,
  },
  exportText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  delete: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteText: {
    color: colors.roseDeep,
    fontSize: 15,
    fontWeight: '600',
  },
});
