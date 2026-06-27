import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Manipulable } from '../features/canvas/components/Manipulable';
import { TextEditorModal } from '../features/canvas/components/TextEditorModal';
import { FontPicker } from '../features/library/components/FontPicker';
import { DEFAULT_FONT } from '../core/theme/fonts';
import { colors, radius } from '../core/theme/tokens';
import type { CanvasItem, Transform } from '../data/models/journal';
import {
  loadJournal,
  persistImage,
  saveJournal,
} from '../data/storage/journalStorage';

const nextId = () =>
  `it_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

// Contenido de la primera apertura (cuando aún no hay journal guardado).
const seedItems = (): CanvasItem[] => [
  {
    id: nextId(),
    kind: 'text',
    text: "Verano '26",
    font: DEFAULT_FONT.family,
    x: 70,
    y: 120,
    scale: 1,
    rotation: -0.04,
  },
];

export default function CanvasScreen() {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar al abrir.
  useEffect(() => {
    const journal = loadJournal();
    setItems(journal ? journal.items : seedItems());
    setLoaded(true);
  }, []);

  // Autoguardado con debounce cada vez que cambian los elementos.
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveJournal(items), 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [items, loaded]);

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const activate = (id: string) => {
    setSelectedId(id);
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const copy = [...prev];
      const [picked] = copy.splice(idx, 1);
      copy.push(picked);
      return copy;
    });
  };

  const sendToBack = (id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const [picked] = copy.splice(idx, 1);
      copy.unshift(picked);
      return copy;
    });
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedId(null);
  };

  const updateTransform = (id: string, t: Transform) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...t } : i)));
  };

  const setFont = (family: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedId && i.kind === 'text' ? { ...i, font: family } : i
      )
    );
  };

  const addPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!res.canceled) {
      const uri = persistImage(res.assets[0].uri);
      const id = nextId();
      setItems((prev) => [
        ...prev,
        { id, kind: 'photo', uri, x: 90, y: 260, scale: 1, rotation: 0.05 },
      ]);
      setSelectedId(id);
    }
  };

  const addText = () => {
    const id = nextId();
    setItems((prev) => [
      ...prev,
      {
        id,
        kind: 'text',
        text: '',
        font: DEFAULT_FONT.family,
        x: 80,
        y: 200,
        scale: 1,
        rotation: 0,
      },
    ]);
    setSelectedId(id);
    setDraft('');
    setEditingId(id);
  };

  const openEditor = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item?.kind === 'text') {
      setDraft(item.text);
      setEditingId(id);
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

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Lienzo de papel kraft */}
      <View style={styles.canvas}>
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
              selected={selectedId === item.id}
              onActivate={() => activate(item.id)}
              onTransformEnd={(t) => updateTransform(item.id, t)}
            >
              {item.kind === 'photo' ? (
                <View style={styles.photoFrame}>
                  <Image source={{ uri: item.uri }} style={styles.photo} />
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
          <View style={styles.fontStrip}>
            <FontPicker value={selectedItem.font} onSelect={setFont} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.kraft,
  },
  canvas: {
    flex: 1,
    overflow: 'hidden',
  },
  photoFrame: {
    backgroundColor: colors.white,
    padding: 8,
    paddingBottom: 22,
    borderRadius: 4,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  photo: {
    width: 220,
    height: 280,
    borderRadius: 2,
    backgroundColor: colors.kraftLight,
  },
  handwriting: {
    fontSize: 56,
    color: colors.ink,
  },
  toolbarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  fontStrip: {
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
    paddingHorizontal: 22,
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
