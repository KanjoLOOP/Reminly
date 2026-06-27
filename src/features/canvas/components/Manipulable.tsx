import React from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  initialRotation?: number; // en grados
  /** Se llama al tocar el elemento (para traerlo al frente). */
  onActivate?: () => void;
};

/**
 * Envuelve cualquier elemento del lienzo y lo hace manipulable con gestos:
 * arrastrar (1 dedo), escalar (pinza) y rotar (2 dedos), de forma simultánea.
 * Toda la transformación corre en el hilo de UI (worklets) para ir a 60/120 fps.
 */
export function Manipulable({
  children,
  initialX = 0,
  initialY = 0,
  initialRotation = 0,
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
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  item: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
