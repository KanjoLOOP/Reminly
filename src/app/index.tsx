import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Manipulable } from '../features/canvas/components/Manipulable';
import { TextEditorModal } from '../features/canvas/components/TextEditorModal';
import { FontPicker } from '../features/library/components/FontPicker';
import { DEFAULT_FONT } from '../core/theme/fonts';
import { colors, radius } from '../core/theme/tokens';

type Item =
  | { id: string; kind: 'photo'; uri: string; x: number; y: number; rot: number }
  | {
      id: string;
      kind: 'text';
      text: string;
      font: string;
      x: number;
      y: number;
      rot: number;
    };

let counter = 0;
const nextId = () => `item_${counter++}`;

export default function CanvasScreen() {
  const [items, setItems] = useState<Item[]>([
    {
      id: nextId(),
      kind: 'photo',
      uri: 'https://picsum.photos/seed/reminly/280/360',
      x: 40,
      y: 150,
      rot: -4,
    },
    {
      id: nextId(),
      kind: 'text',
      text: "Verano '26",
      font: DEFAULT_FONT.family,
      x: 70,
      y: 90,
      rot: -2,
    },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Edición de texto
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  // Selecciona y trae al frente (mueve al final del array → se dibuja encima).
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
      const id = nextId();
      setItems((prev) => [
        ...prev,
        { id, kind: 'photo', uri: res.assets[0].uri, x: 90, y: 260, rot: 3 },
      ]);
      setSelectedId(id);
    }
  };

  const addText = () => {
    const id = nextId();
    setItems((prev) => [
      ...prev,
      { id, kind: 'text', text: '', font: DEFAULT_FONT.family, x: 80, y: 200, rot: 0 },
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
      // Texto vacío → no tiene sentido conservarlo.
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
    // Si era un texto recién creado y sigue vacío, lo descartamos.
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
        {/* Capa de fondo: tocar el papel vacío deselecciona */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setSelectedId(null)}
        />

        {/* Capa de elementos. box-none deja pasar los toques al fondo
            salvo donde hay un elemento real. */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {items.map((item) => (
            <Manipulable
              key={item.id}
              initialX={item.x}
              initialY={item.y}
              initialRotation={item.rot}
              selected={selectedId === item.id}
              onActivate={() => activate(item.id)}
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
        {/* Selector de fuente: solo cuando hay un texto seleccionado */}
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
