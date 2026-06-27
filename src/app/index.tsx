import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Manipulable } from '../features/canvas/components/Manipulable';
import { colors, radius } from '../core/theme/tokens';

type Item =
  | { id: string; kind: 'photo'; uri: string; x: number; y: number; rot: number }
  | { id: string; kind: 'text'; text: string; x: number; y: number; rot: number };

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
    { id: nextId(), kind: 'text', text: "Verano '26", x: 70, y: 90, rot: -2 },
  ]);

  // Mueve el elemento tocado al final del array → se renderiza encima.
  const bringToFront = (id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const copy = [...prev];
      const [picked] = copy.splice(idx, 1);
      copy.push(picked);
      return copy;
    });
  };

  const addPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!res.canceled) {
      setItems((prev) => [
        ...prev,
        {
          id: nextId(),
          kind: 'photo',
          uri: res.assets[0].uri,
          x: 90,
          y: 260,
          rot: 3,
        },
      ]);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Lienzo de papel kraft */}
      <View style={styles.canvas}>
        {items.map((item) =>
          item.kind === 'photo' ? (
            <Manipulable
              key={item.id}
              initialX={item.x}
              initialY={item.y}
              initialRotation={item.rot}
              onActivate={() => bringToFront(item.id)}
            >
              <View style={styles.photoFrame}>
                <Image source={{ uri: item.uri }} style={styles.photo} />
              </View>
            </Manipulable>
          ) : (
            <Manipulable
              key={item.id}
              initialX={item.x}
              initialY={item.y}
              initialRotation={item.rot}
              onActivate={() => bringToFront(item.id)}
            >
              <Text style={styles.handwriting}>{item.text}</Text>
            </Manipulable>
          )
        )}
      </View>

      {/* Barra inferior */}
      <SafeAreaView edges={['bottom']} style={styles.toolbarWrap}>
        <View style={styles.toolbar}>
          <Pressable style={styles.toolButton} onPress={addPhoto}>
            <Text style={styles.toolButtonText}>＋ Foto</Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
    // sombra cálida (no negra)
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
    fontSize: 44,
    color: colors.ink,
    // TODO: cargar la fuente Caveat con expo-font para el look manuscrito
  },
  toolbarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
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
    backgroundColor: colors.rose,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  toolButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
