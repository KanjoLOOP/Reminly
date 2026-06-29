import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { colors } from '../../../core/theme/tokens';
import type { Transform } from '../../../data/models/journal';

export type Size = { width: number; height: number };

type Props = {
  children: React.ReactNode;
  transform: Transform;
  size: Size;
  /** 'both' = ancho y alto (fotos); 'horizontal' = solo ancho (texto);
   *  'none' = sin tirador, tamaño por contenido (stickers, se escalan con pinza). */
  resizeMode?: 'both' | 'horizontal' | 'none';
  selected?: boolean;
  onActivate?: () => void;
  onTransformEnd?: (t: Transform) => void;
  onResizeEnd?: (s: Size) => void;
};

const MIN_W = 48;
const MIN_H = 48;

/**
 * Elemento manipulable del lienzo. Gestos: arrastrar (1 dedo), escalar uniforme
 * (pinza), rotar (2 dedos) y, con un tirador, redimensionar ancho/alto libremente.
 * El redimensionado compensa la escala y la rotación para que el tirador siga al dedo.
 */
export function Manipulable({
  children,
  transform,
  size,
  resizeMode = 'both',
  selected = false,
  onActivate,
  onTransformEnd,
  onResizeEnd,
}: Props) {
  const tx = useSharedValue(transform.x);
  const ty = useSharedValue(transform.y);
  const savedTx = useSharedValue(transform.x);
  const savedTy = useSharedValue(transform.y);

  const scale = useSharedValue(transform.scale);
  const savedScale = useSharedValue(transform.scale);

  const rotation = useSharedValue(transform.rotation);
  const savedRotation = useSharedValue(transform.rotation);

  const w = useSharedValue(size.width);
  const h = useSharedValue(size.height);
  const savedW = useSharedValue(size.width);
  const savedH = useSharedValue(size.height);

  const commitTransform = () => {
    'worklet';
    if (onTransformEnd) {
      runOnJS(onTransformEnd)({
        x: tx.value,
        y: ty.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    }
  };

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      if (onActivate) runOnJS(onActivate)();
    })
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
      commitTransform();
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      commitTransform();
    });

  const rotate = Gesture.Rotation()
    .onUpdate((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      commitTransform();
    });

  // Toque simple para seleccionar (cuando NO está seleccionado).
  const tap = Gesture.Tap().onEnd(() => {
    if (onActivate) runOnJS(onActivate)();
  });

  // "Lock": solo el elemento seleccionado responde a mover/escalar/rotar.
  // El resto solo se puede seleccionar con un toque, así un toque accidental
  // sobre otro elemento no interrumpe la manipulación en curso.
  const mainGesture = selected
    ? Gesture.Simultaneous(pan, pinch, rotate)
    : tap;

  const resizeGesture = Gesture.Pan()
    .onUpdate((e) => {
      // delta de pantalla → espacio local: deshacer rotación y escala
      const r = -rotation.value;
      const c = Math.cos(r);
      const s = Math.sin(r);
      const dx = (e.translationX * c - e.translationY * s) / scale.value;
      const dy = (e.translationX * s + e.translationY * c) / scale.value;
      w.value = Math.max(MIN_W, savedW.value + dx);
      if (resizeMode === 'both') {
        h.value = Math.max(MIN_H, savedH.value + dy);
      }
    })
    .onEnd(() => {
      savedW.value = w.value;
      savedH.value = h.value;
      if (onResizeEnd) {
        runOnJS(onResizeEnd)({ width: w.value, height: h.value });
      }
    })
    .blocksExternalGesture(pan);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  }));

  const sizeStyle = useAnimatedStyle(() => {
    if (resizeMode === 'both') return { width: w.value, height: h.value };
    if (resizeMode === 'horizontal') return { width: w.value };
    return {}; // 'none': tamaño por contenido
  });

  return (
    <GestureDetector gesture={mainGesture}>
      <Animated.View style={[styles.item, outerStyle]}>
        <Animated.View style={sizeStyle}>
          {children}

          {selected && (
            <>
              <View pointerEvents="none" style={styles.selection} />
              {resizeMode !== 'none' && (
                <GestureDetector gesture={resizeGesture}>
                  <View
                    style={[
                      styles.resizeHandle,
                      resizeMode === 'both'
                        ? styles.handleCorner
                        : styles.handleRight,
                    ]}
                    hitSlop={12}
                  >
                    <View style={styles.resizeDot} />
                  </View>
                </GestureDetector>
              )}
            </>
          )}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const HANDLE = 26;

const styles = StyleSheet.create({
  item: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  selection: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderWidth: 2,
    borderColor: colors.rose,
    borderRadius: 6,
  },
  resizeHandle: {
    position: 'absolute',
    width: HANDLE,
    height: HANDLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleCorner: {
    right: -HANDLE / 2 - 6,
    bottom: -HANDLE / 2 - 6,
  },
  handleRight: {
    right: -HANDLE / 2 - 6,
    top: '50%',
    marginTop: -HANDLE / 2,
  },
  resizeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.rose,
  },
});
