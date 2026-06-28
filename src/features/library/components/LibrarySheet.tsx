import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radius } from '../../../core/theme/tokens';
import { FONT_OPTIONS } from '../../../core/theme/fonts';
import type { PaperPattern } from '../../../data/models/journal';
import { FRAME_OPTIONS } from '../data/frames';
import { STICKERS } from '../data/stickers';
import { WASHI_OPTIONS } from '../data/washi';

type Tab = 'stickers' | 'papeles' | 'washi' | 'marcos' | 'tipografias';

type SelKind = 'photo' | 'text' | 'sticker' | 'washi' | null;

type Props = {
  visible: boolean;
  onClose: () => void;
  initialTab?: Tab;
  selectedKind: SelKind;
  selectedFont?: string;
  selectedFrame?: string;
  background: { color: string; pattern: PaperPattern };
  selectedTextColor?: string;
  onAddSticker: (emoji: string) => void;
  onAddWashi: (id: string) => void;
  onSetFont: (family: string) => void;
  onSetTextColor: (color: string) => void;
  onSetFrame: (id: string) => void;
  onSetBackground: (bg: { color: string; pattern: PaperPattern }) => void;
};

const TEXT_COLORS = [
  '#3B3A36', '#9A8F7D', '#E8A598', '#D98A73', '#A7B9A0',
  '#6E7F74', '#9FC0D4', '#C9B3D8', '#E9C46A', '#FFFFFF',
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'stickers', label: 'Stickers' },
  { id: 'papeles', label: 'Papeles' },
  { id: 'washi', label: 'Washi' },
  { id: 'marcos', label: 'Marcos' },
  { id: 'tipografias', label: 'Tipografías' },
];

const PAPER_COLORS = [
  '#FBF7F0', '#F4EDE1', '#EFE7D6', '#FBEAE5',
  '#E9EFE6', '#E6EEF2', '#F0E9F2', '#FFFFFF',
];

const PATTERNS: { id: PaperPattern; label: string }[] = [
  { id: 'blank', label: 'Liso' },
  { id: 'grid', label: 'Cuadrícula' },
  { id: 'lines', label: 'Líneas' },
];

export function LibrarySheet({
  visible,
  onClose,
  initialTab,
  selectedKind,
  selectedFont,
  selectedFrame,
  selectedTextColor,
  background,
  onAddSticker,
  onAddWashi,
  onSetFont,
  onSetTextColor,
  onSetFrame,
  onSetBackground,
}: Props) {
  const [tab, setTab] = useState<Tab>('stickers');

  useEffect(() => {
    if (visible && initialTab) setTab(initialTab);
  }, [visible, initialTab]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.grabber} />
          <Text style={styles.title}>Biblioteca</Text>

          {/* Pestañas */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTab(t.id)}
                  style={[styles.tab, active && styles.tabActive]}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {tab === 'stickers' && (
              <View style={styles.grid}>
                {STICKERS.map((s, i) => (
                  <Pressable
                    key={`${s}-${i}`}
                    style={styles.stickerCell}
                    onPress={() => {
                      onAddSticker(s);
                      onClose();
                    }}
                  >
                    <Text style={styles.stickerEmoji}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {tab === 'papeles' && (
              <View>
                <Text style={styles.section}>Color</Text>
                <View style={styles.swatches}>
                  {PAPER_COLORS.map((c) => {
                    const active = c.toLowerCase() === background.color.toLowerCase();
                    return (
                      <Pressable
                        key={c}
                        onPress={() =>
                          onSetBackground({ color: c, pattern: background.pattern })
                        }
                        style={[
                          styles.swatch,
                          { backgroundColor: c },
                          active && styles.swatchActive,
                        ]}
                      />
                    );
                  })}
                </View>
                <Text style={styles.section}>Estilo</Text>
                <View style={styles.patterns}>
                  {PATTERNS.map((p) => {
                    const active = p.id === background.pattern;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() =>
                          onSetBackground({ color: background.color, pattern: p.id })
                        }
                        style={[styles.patternBtn, active && styles.patternActive]}
                      >
                        <Text
                          style={[styles.patternText, active && styles.patternTextActive]}
                        >
                          {p.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {tab === 'washi' && (
              <View style={styles.grid}>
                {WASHI_OPTIONS.map((w) => (
                  <Pressable
                    key={w.id}
                    style={styles.washiCell}
                    onPress={() => {
                      onAddWashi(w.id);
                      onClose();
                    }}
                  >
                    <View style={styles.washiPreview}>
                      {w.pattern === 'stripes' ? (
                        <View style={styles.washiRow}>
                          {Array.from({ length: 8 }).map((_, i) => (
                            <View
                              key={i}
                              style={{
                                flex: 1,
                                backgroundColor: i % 2 === 0 ? w.base : w.alt,
                              }}
                            />
                          ))}
                        </View>
                      ) : (
                        <View
                          style={[styles.washiSolid, { backgroundColor: w.base }]}
                        >
                          {w.pattern === 'dots' &&
                            Array.from({ length: 5 }).map((_, i) => (
                              <View
                                key={i}
                                style={[styles.washiDot, { backgroundColor: w.alt }]}
                              />
                            ))}
                        </View>
                      )}
                    </View>
                    <Text style={styles.cellLabel}>{w.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {tab === 'marcos' && (
              <View>
                {selectedKind !== 'photo' && (
                  <Text style={styles.hint}>
                    Selecciona una foto para cambiar su marco.
                  </Text>
                )}
                <View style={styles.grid}>
                  {FRAME_OPTIONS.map((f) => {
                    const active = f.id === selectedFrame;
                    const disabled = selectedKind !== 'photo';
                    return (
                      <Pressable
                        key={f.id}
                        disabled={disabled}
                        onPress={() => onSetFrame(f.id)}
                        style={[
                          styles.frameCell,
                          active && styles.cellActive,
                          disabled && styles.cellDisabled,
                        ]}
                      >
                        <View style={[styles.framePreview, f.container]}>
                          <View
                            style={[styles.framePreviewImg, { borderRadius: f.imageRadius }]}
                          />
                        </View>
                        <Text style={styles.cellLabel}>{f.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {tab === 'tipografias' && (
              <View>
                {selectedKind !== 'text' && (
                  <Text style={styles.hint}>
                    Selecciona un texto para cambiar su tipografía.
                  </Text>
                )}
                <View style={styles.grid}>
                  {FONT_OPTIONS.map((f) => {
                    const active = f.family === selectedFont;
                    const disabled = selectedKind !== 'text';
                    return (
                      <Pressable
                        key={f.id}
                        disabled={disabled}
                        onPress={() => onSetFont(f.family)}
                        style={[
                          styles.fontCell,
                          active && styles.cellActive,
                          disabled && styles.cellDisabled,
                        ]}
                      >
                        <Text style={[styles.fontPreview, { fontFamily: f.family }]}>
                          {f.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {selectedKind === 'text' && (
                  <>
                    <Text style={styles.section}>Color del texto</Text>
                    <View style={styles.swatches}>
                      {TEXT_COLORS.map((c) => {
                        const active =
                          c.toLowerCase() === (selectedTextColor ?? '').toLowerCase();
                        return (
                          <Pressable
                            key={c}
                            onPress={() => onSetTextColor(c)}
                            style={[
                              styles.swatch,
                              { backgroundColor: c },
                              active && styles.swatchActive,
                            ]}
                          />
                        );
                      })}
                    </View>
                  </>
                )}
              </View>
            )}
          </ScrollView>
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
    paddingBottom: 28,
    maxHeight: '78%',
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.kraftMuted,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
    paddingHorizontal: 20,
  },
  tabs: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.paperCream,
  },
  tabActive: {
    backgroundColor: colors.ink,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  tabTextActive: {
    color: colors.white,
  },
  body: {
    paddingHorizontal: 16,
  },
  bodyContent: {
    paddingBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stickerCell: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.paperCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerEmoji: {
    fontSize: 30,
  },
  washiCell: {
    width: 100,
    alignItems: 'center',
    gap: 6,
  },
  washiPreview: {
    width: 100,
    height: 28,
    borderRadius: 3,
    overflow: 'hidden',
    transform: [{ rotate: '-3deg' }],
  },
  washiRow: {
    flex: 1,
    flexDirection: 'row',
  },
  washiSolid: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    opacity: 0.9,
  },
  washiDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkMuted,
    marginTop: 8,
    marginBottom: 8,
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
  hint: {
    fontSize: 13,
    color: colors.inkMuted,
    marginBottom: 12,
  },
  frameCell: {
    width: 92,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.paperCream,
    gap: 6,
  },
  framePreview: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  framePreviewImg: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.kraftLight,
  },
  fontCell: {
    width: 104,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.paperCream,
  },
  fontPreview: {
    fontSize: 24,
    color: colors.ink,
  },
  cellActive: {
    borderWidth: 2,
    borderColor: colors.rose,
  },
  cellDisabled: {
    opacity: 0.45,
  },
  cellLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
  },
});
