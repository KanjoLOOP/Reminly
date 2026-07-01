import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { fontAssets } from '../core/theme/fonts';
import { AnimatedSplash } from '../features/splash/AnimatedSplash';

// Evita que el splash nativo se oculte antes de tener las fuentes listas.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontAssets);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
      {!splashDone && <AnimatedSplash onFinish={() => setSplashDone(true)} />}
    </GestureHandlerRootView>
  );
}
