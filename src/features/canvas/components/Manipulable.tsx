import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { colors } from '../../../core/theme/tokens';

type Props = {
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  initialRotation?: number; // en grados
  selected?: boolean;
  /** Se llama al tocar el elemento (para seleccionarlo y traerlo al frente). */
  onActivate?: () => void;
};

/**
 * Envuelve cualquier elemento del lienzo y lo hace manipulable con gestos:
 * arrastrar (1 dedo), escalar (pinza) y rotar (2 dedos), de forma simultánea.
 * Toda la transformación corre en el hilo de UI (worklets) para ir a 60/120 fps.
 * Cuando está seleccionado, dibuja un marco con tiradores en las esquinas.
 */
export function Manipulable({
  children,
  initialX = 0,
  initialY = 0,
  initialRotation = 0,
  selected = false,
  onActivate,
}: Props) {
  const tx = useSharedValue(initialX);
  const ty = useSharedValue(initialY);
  const savedTx = useSharedValue(initialX);
  const savedTy = useSharedValue(initialY);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const rotation = useSharedValue((initialRotation * Math.PI) / 180);
  const savedRotation = useSharedValue((initialRotation * Math.PI) / 180);

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onBegin(() => {
      if (onActivate) {
        runOnJS(onActivate)();
      }
    })
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotate = Gesture.Rotation()
    .onUpdate((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const gesture = Gesture.Simultaneous(pan, pinch, rotate);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.item, animatedStyle]}>
        {children}
        {selected && (
          <View pointerEvents="none" style={styles.selection}>
            <View style={[styles.handle, styles.tl]} />
            <View style={[styles.handle, styles.tr]} />
            <View style={[styles.handle, styles.bl]} />
            <View style={[styles.handle, styles.br]} />
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const HANDLE = 12;

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
  handle: {
    position: 'absolute',
    width: HANDLE,
    height: HANDLE,
    borderRadius: HANDLE / 2,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.rose,
  },
  tl: { top: -HANDLE / 2, left: -HANDLE / 2 },
  tr: { top: -HANDLE / 2, right: -HANDLE / 2 },
  bl: { bottom: -HANDLE / 2, left: -HANDLE / 2 },
  br: { bottom: -HANDLE / 2, right: -HANDLE / 2 },
});
