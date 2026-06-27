import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundModal } from '../../features/canvas/components/BackgroundModal';
import { Manipulable, Size } from '../../features/canvas/components/Manipulable';
import { PaperBackground } from '../../features/canvas/components/PaperBackground';
import { TextEditorModal } from '../../features/canvas/components/TextEditorModal';
import { FontPicker } from '../../features/library/components/FontPicker';
import { FramePicker } from '../../features/library/components/FramePicker';
import { DEFAULT_FRAME, getFrame } from '../../features/library/data/frames';
import { DEFAULT_FONT } from '../../core/theme/fonts';
import { colors, radius } from '../../core/theme/tokens';
import {
  CanvasItem,
  DEFAULT_BACKGROUND,
  Journal,
  PaperBackground as Bg,
  Transform,
} from '../../data/models/journal';
import {
  loadJournal,
  persistImage,
  saveJournal,
} from '../../data/storage/journalStorage';

const nextId = () =>
  `it_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const PHOTO_W = 220;
const PHOTO_H = 280;
const TEXT_W = 240;
const TEXT_H = 80;

// Rellena valores que journals antiguos pueden no tener.
function normalize(j: Journal): Journal {
  const items = j.items.map((i) => {
    const base = {
      ...i,
      width: i.width ?? (i.kind === 'photo' ? PHOTO_W : TEXT_W),
      height: i.height ?? (i.kind === 'photo' ? PHOTO_H : TEXT_H),
    };
    return i.kind === 'photo'
      ? { ...base, frame: (i as any).frame ?? DEFAULT_FRAME.id }
      : base;
  }) as CanvasItem[];
  return { ...j, background: j.background ?? DEFAULT_BACKGROUND, items };
}

export default function JournalEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [journal, setJournal] = useState<Journal | null>(null);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [background, setBackground] = useState<Bg>(DEFAULT_BACKGROUND);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [bgOpen, setBgOpen] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    const j = loadJournal(id);
    if (j) {
      const norm = normalize(j);
      setJournal(norm);
      setItems(norm.items);
      setBackground(norm.background);
    }
    setLoaded(true);
  }, [id]);

  useEffect(() => {
    if (!loaded || !journal) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(
      () => saveJournal({ ...journal, background, items }),
      600
    );
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [items, background, journal, loaded]);

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const activate = (itemId: string) => {
    setSelectedId(itemId);
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === itemId);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const copy = [...prev];
      const [picked] = copy.splice(idx, 1);
      copy.push(picked);
      return copy;
    });
  };

  const sendToBack = (itemId: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === itemId);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const [picked] = copy.splice(idx, 1);
      copy.unshift(picked);
      return copy;
    });
  };

  const deleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setSelectedId(null);
  };

  const updateTransform = (itemId: string, t: Transform) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...t } : i)));
  };

  const updateSize = (itemId: string, s: Size) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...s } : i)));
  };

  const setFont = (family: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedId && i.kind === 'text' ? { ...i, font: family } : i
      )
    );
  };

  const setFrame = (frame: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedId && i.kind === 'photo' ? { ...i, frame } : i
      )
    );
  };

  const addPhoto = async () => {
    if (!id) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!res.canceled) {
      const uri = persistImage(id, res.assets[0].uri);
      const itemId = nextId();
      setItems((prev) => [
        ...prev,
        {
          id: itemId,
          kind: 'photo',
          uri,
          frame: DEFAULT_FRAME.id,
          x: 90,
          y: 260,
          width: PHOTO_W,
          height: PHOTO_H,
          scale: 1,
          rotation: 0.05,
        },
      ]);
      setSelectedId(itemId);
    }
  };

  const addText = () => {
    const itemId = nextId();
    setItems((prev) => [
      ...prev,
      {
        id: itemId,
        kind: 'text',
        text: '',
        font: DEFAULT_FONT.family,
        x: 80,
        y: 200,
        width: TEXT_W,
        height: TEXT_H,
        scale: 1,
        rotation: 0,
      },
    ]);
    setSelectedId(itemId);
    setDraft('');
    setEditingId(itemId);
  };

  const openEditor = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item?.kind === 'text') {
      setDraft(item.text);
      setEditingId(itemId);
    }
  };

  const saveText = () => {
    if (!editingId) return;
    const text = draft.trim();
    if (text.length === 0) {
      deleteItem(editingId);
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingId && i.kind === 'text' ? { ...i, text } : i
        )
      );
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    if (!editingId) return;
    const item = items.find((i) => i.id === editingId);
    if (item?.kind === 'text' && item.text.length === 0) {
      deleteItem(editingId);
    }
    setEditingId(null);
  };

  const openRename = () => {
    setTitleDraft(journal?.title ?? '');
    setRenaming(true);
  };

  const saveRename = () => {
    const title = titleDraft.trim();
    if (journal && title.length > 0) setJournal({ ...journal, title });
    setRenaming(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: background.color }]}>
      <StatusBar style="dark" />

      {/* Cabecera */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: background.color }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Pressable style={styles.titleWrap} onPress={openRename} hitSlop={8}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {journal?.title ?? '…'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Lienzo */}
      <View style={styles.canvas}>
        <PaperBackground color={background.color} pattern={background.pattern} />

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setSelectedId(null)}
        />

        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {items.map((item) => (
            <Manipulable
              key={item.id}
              transform={{
                x: item.x,
                y: item.y,
                scale: item.scale,
                rotation: item.rotation,
              }}
              size={{ width: item.width, height: item.height }}
              resizeMode={item.kind === 'photo' ? 'both' : 'horizontal'}
              selected={selectedId === item.id}
              onActivate={() => activate(item.id)}
              onTransformEnd={(t) => updateTransform(item.id, t)}
              onResizeEnd={(s) => updateSize(item.id, s)}
            >
              {item.kind === 'photo' ? (
                <View style={[styles.frame, getFrame(item.frame).container]}>
                  <Image
                    source={{ uri: item.uri }}
                    style={[
                      styles.photo,
                      { borderRadius: getFrame(item.frame).imageRadius },
                    ]}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <Text style={[styles.handwriting, { fontFamily: item.font }]}>
                  {item.text}
                </Text>
              )}
            </Manipulable>
          ))}
        </View>
      </View>

      {/* Barra inferior */}
      <SafeAreaView edges={['bottom']} style={styles.toolbarWrap}>
        {selectedItem?.kind === 'text' && (
          <View style={styles.strip}>
            <FontPicker value={selectedItem.font} onSelect={setFont} />
          </View>
        )}
        {selectedItem?.kind === 'photo' && (
          <View style={styles.strip}>
            <FramePicker value={selectedItem.frame} onSelect={setFrame} />
          </View>
        )}

        <View style={styles.toolbar}>
          {selectedItem ? (
            <>
              {selectedItem.kind === 'text' && (
                <Pressable
                  style={[styles.toolButton, styles.btnNeutral]}
                  onPress={() => openEditor(selectedItem.id)}
                >
                  <Text style={styles.btnNeutralText}>Editar</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.toolButton, styles.btnNeutral]}
                onPress={() => sendToBack(selectedItem.id)}
              >
                <Text style={styles.btnNeutralText}>Al fondo</Text>
              </Pressable>
              <Pressable
                style={[styles.toolButton, styles.btnDanger]}
                onPress={() => deleteItem(selectedItem.id)}
              >
                <Text style={styles.btnDangerText}>Borrar</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={[styles.toolButton, styles.btnAccent]}
                onPress={addPhoto}
              >
                <Text style={styles.btnAccentText}>＋ Foto</Text>
              </Pressable>
              <Pressable
                style={[styles.toolButton, styles.btnNeutral]}
                onPress={addText}
              >
                <Text style={styles.btnNeutralText}>＋ Texto</Text>
              </Pressable>
              <Pressable
                style={[styles.toolButton, styles.btnNeutral]}
                onPress={() => setBgOpen(true)}
              >
                <Text style={styles.btnNeutralText}>Fondo</Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>

      <TextEditorModal
        visible={editingId !== null}
        value={draft}
        onChangeText={setDraft}
        onSave={saveText}
        onCancel={cancelEdit}
      />
      <TextEditorModal
        visible={renaming}
        value={titleDraft}
        onChangeText={setTitleDraft}
        onSave={saveRename}
        onCancel={() => setRenaming(false)}
        title="Título del journal"
        placeholder="Verano '26…"
      />
      <BackgroundModal
        visible={bgOpen}
        color={background.color}
        pattern={background.pattern}
        onChange={setBackground}
        onClose={() => setBgOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 34,
    lineHeight: 34,
    color: colors.ink,
  },
  titleWrap: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  canvas: {
    flex: 1,
    overflow: 'hidden',
  },
  frame: {
    width: '100%',
    height: '100%',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  photo: {
    flex: 1,
    backgroundColor: colors.kraftLight,
  },
  handwriting: {
    fontSize: 40,
    color: colors.ink,
  },
  toolbarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  strip: {
    width: '100%',
    paddingBottom: 10,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: colors.paperLight,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: radius.pill,
    marginBottom: 12,
    gap: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
  },
  toolButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  btnAccent: { backgroundColor: colors.rose },
  btnAccentText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  btnNeutral: { backgroundColor: colors.paperCream },
  btnNeutralText: { color: colors.ink, fontSize: 16, fontWeight: '600' },
  btnDanger: { backgroundColor: colors.roseDeep },
  btnDangerText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
