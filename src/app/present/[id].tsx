import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { AudioNote } from '../../features/canvas/components/AudioNote';
import { PaperBackground } from '../../features/canvas/components/PaperBackground';
import { VideoElement } from '../../features/canvas/components/VideoElement';
import { WashiStrip } from '../../features/canvas/components/WashiStrip';
import { getFrame } from '../../features/library/data/frames';
import { colors } from '../../core/theme/tokens';
import type { CanvasItem, Page } from '../../data/models/journal';
import { loadJournal } from '../../data/storage/journalStorage';

/** Render estático de un elemento (sin gestos), igual que en el editor. */
function ItemView({ item }: { item: CanvasItem }) {
  const outer = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    transform: [
      { translateX: item.x },
      { translateY: item.y },
      { scale: item.scale },
      { rotate: `${item.rotation}rad` },
    ],
  };

  let sizeStyle: object = {};
  if (item.kind === 'photo' || item.kind === 'video') {
    sizeStyle = { width: item.width, height: item.height };
  } else if (item.kind === 'text' || item.kind === 'washi') {
    sizeStyle = { width: item.width };
  }

  return (
    <View style={outer}>
      <View style={sizeStyle}>
        {item.kind === 'photo' ? (
          <View style={[styles.frame, getFrame(item.frame).container]}>
            <Image
              source={{ uri: item.uri }}
              style={[styles.photo, { borderRadius: getFrame(item.frame).imageRadius }]}
              contentFit="cover"
            />
          </View>
        ) : item.kind === 'text' ? (
          <Text style={[styles.handwriting, { fontFamily: item.font, color: item.color }]}>
            {item.text}
          </Text>
        ) : item.kind === 'sticker' ? (
          <View style={{ width: item.width, height: item.height, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.sticker}>{item.emoji}</Text>
          </View>
        ) : item.kind === 'washi' ? (
          <WashiStrip style={item.style} height={item.height} />
        ) : item.kind === 'video' ? (
          <View style={styles.videoFrame}>
            <VideoElement uri={item.uri} radius={6} />
          </View>
        ) : (
          <AudioNote uri={item.uri} durationMs={item.durationMs} />
        )}
      </View>
    </View>
  );
}

export default function Present() {
  const { id, page } = useLocalSearchParams<{ id: string; page?: string }>();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const journal = useMemo(() => (id ? loadJournal(id) : null), [id]);
  const pages: Page[] = (journal?.pages ?? []) as Page[];
  const initial = Math.max(0, Math.min(pages.length - 1, Number(page) || 0));
  const [index, setIndex] = useState(initial);
  const listRef = useRef<FlatList<Page>>(null);

  if (pages.length === 0) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <StatusBar style="dark" hidden />
        <Text style={styles.empty}>Esta libreta no tiene páginas.</Text>
        <Pressable style={styles.closeInline} onPress={() => router.back()}>
          <Text style={styles.closeInlineText}>Salir</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" hidden />

      <FlatList
        ref={listRef}
        data={pages}
        keyExtractor={(p) => p.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initial}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item: pg }) => (
          <View style={{ width, height }}>
            <PaperBackground
              color={pg.background.color}
              pattern={pg.background.pattern}
              lineColor={pg.background.lineColor}
            />
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {pg.items.map((it) => (
                <ItemView key={it.id} item={it} />
              ))}
            </View>
          </View>
        )}
      />

      {/* Overlay: indicador + salir */}
      <View style={styles.topBar} pointerEvents="box-none">
        <Text style={styles.indicator}>
          {index + 1} / {pages.length}
        </Text>
        <Pressable style={styles.close} onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperCream },
  frame: {
    width: '100%',
    height: '100%',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  photo: { flex: 1, backgroundColor: colors.kraftLight },
  videoFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    padding: 6,
    borderRadius: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  handwriting: { fontSize: 40, color: colors.ink },
  sticker: { fontSize: 64 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  indicator: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    backgroundColor: 'rgba(251,247,240,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(251,247,240,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 18, fontWeight: '700', color: colors.ink },
  empty: { fontSize: 16, color: colors.inkMuted, marginBottom: 16 },
  closeInline: {
    backgroundColor: colors.ink,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  closeInlineText: { color: colors.white, fontWeight: '700' },
});
