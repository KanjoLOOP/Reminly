import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';

import { colors } from '../../../core/theme/tokens';

type Props = {
  uri: string;
  radius?: number;
};

/**
 * Vídeo del lienzo: reproducción en bucle, silenciado y sin controles, como un
 * recuerdo "vivo". Rellena su contenedor (la caja la maneja el Manipulable).
 */
export function VideoElement({ uri, radius = 2 }: Props) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      nativeControls={false}
      contentFit="cover"
      style={[styles.video, { borderRadius: radius }]}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    flex: 1,
    backgroundColor: colors.kraftLight,
  },
});
