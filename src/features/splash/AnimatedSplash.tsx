import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors, typography } from '../../core/theme/tokens';

const LOGO = require('../../../assets/images/logo.png');

/**
 * Splash animado sobre la app: el logo cae y se asienta, aparecen el nombre y
 * el eslogan, y se queda esperando a que el usuario pulse para continuar.
 */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const logoY = useSharedValue(-48);
  const logoRot = useSharedValue(-0.16);
  const logoScale = useSharedValue(0.72);
  const logoOpacity = useSharedValue(0);
  const wordOpacity = useSharedValue(0);
  const wordY = useSharedValue(14);
  const hintOpacity = useSharedValue(0);
  const root = useSharedValue(1);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 900 });
    logoY.value = withSpring(0, { damping: 13, stiffness: 65 });
    logoRot.value = withSpring(0, { damping: 13, stiffness: 65 });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 60 });

    wordOpacity.value = withDelay(1700, withTiming(1, { duration: 850 }));
    wordY.value = withDelay(1700, withTiming(0, { duration: 850 }));

    hintOpacity.value = withDelay(3000, withTiming(1, { duration: 700 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    if (dismissing) return;
    setDismissing(true);
    root.value = withTiming(0, { duration: 500 }, (finished) => {
      if (finished) runOnJS(onFinish)();
    });
  };

  const rootStyle = useAnimatedStyle(() => ({ opacity: root.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { translateY: logoY.value },
      { scale: logoScale.value },
      { rotate: `${logoRot.value}rad` },
    ],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordY.value }],
  }));
  const hintStyle = useAnimatedStyle(() => ({ opacity: hintOpacity.value }));

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={dismiss}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.root, rootStyle]}>
        <Animated.Image source={LOGO} style={[styles.logo, logoStyle]} resizeMode="contain" />
        <Animated.View style={[styles.words, wordStyle]}>
          <Text style={styles.brand}>Reminly</Text>
          <Text style={styles.tag}>Keep your moments alive.</Text>
        </Animated.View>
        <Animated.Text style={[styles.hint, hintStyle]}>
          Pulsa para continuar
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  words: {
    alignItems: 'center',
    marginTop: 8,
  },
  brand: {
    fontSize: 46,
    lineHeight: 64,
    paddingBottom: 8,
    fontFamily: typography.handwritingBold,
    color: colors.ink,
    textAlign: 'center',
  },
  tag: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 2,
  },
  hint: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkMuted,
    letterSpacing: 0.4,
  },
});
