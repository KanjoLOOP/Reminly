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

type Props = {
  children: React.ReactNode;
  /** Transformación inicial (al montar). */
  transform: Transform;
  selected?: boolean;
  /** Al tocar el elemento (seleccionar + traer al frente). */
  onActivate?: () => void;
  /** Al soltar un gesto, con la transformación final (para persistir). */
  onTransformEnd?: (t: Transform) => void;
};

/**
 * Hace manipulable a cualquier elemento del lienzo: arrastrar (1 dedo), escalar
 * (pinza) y rotar (2 dedos), simultáneamente y en el hilo de UI. Al terminar un
 * gesto reporta la transformación para que el padre la guarde.
 */
export function Manipulable({
  children,
  transform,
  selected = false,
  onActivate,
  onTransformEnd,
}: Props) {
  const tx = useSharedValue(transform.x);
  const ty = useSharedValue(transform.y);
  const savedTx = useSharedValue(transform.x);
  const savedTy = useSharedValue(transform.y);

  const scale = useSharedValue(transform.scale);
  const savedScale = useSharedValue(transform.scale);

  const rotation = useSharedValue(transform.rotation);
  const savedRotation = useSharedValue(transform.rotation);

  const commit = () => {
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
      commit();
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      commit();
    });

  const rotate = Gesture.Rotation()
    .onUpdate((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      commit();
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
