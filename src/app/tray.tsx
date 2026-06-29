import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AudioRecorderModal } from '../features/canvas/components/AudioRecorderModal';
import { TextEditorModal } from '../features/canvas/components/TextEditorModal';
import { colors, radius } from '../core/theme/tokens';
import type { JournalSummary } from '../data/models/journal';
import type { TrayItem } from '../data/models/tray';
import { listJournals } from '../data/storage/journalStorage';
import {
  addTrayAudio,
  addTrayPhoto,
  addTrayText,
  addTrayVideo,
  convertTrayToJournal,
  listTray,
  removeTrayItem,
} from '../data/storage/trayStorage';

function fmt(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function Tray() {
  const router = useRouter();
  const [items, setItems] = useState<TrayItem[]>([]);
  const [recOpen, setRecOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [journals, setJournals] = useState<JournalSummary[]>([]);

  const refresh = () => setItems(listTray());
  useFocusEffect(useCallback(() => refresh(), []));

  const addPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!res.canceled) {
      addTrayPhoto(res.assets[0].uri);
      refresh();
    }
  };

  const addVideo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (!res.canceled) {
      addTrayVideo(res.assets[0].uri);
      refresh();
    }
  };

  const saveAudio = (uri: string, durationMs: number) => {
    setRecOpen(false);
    addTrayAudio(uri, durationMs);
    refresh();
  };

  const saveText = () => {
    const t = draft.trim();
    if (t) addTrayText(t);
    setTextOpen(false);
    refresh();
  };

  const remove = (id: string) => {
    removeTrayItem(id);
    refresh();
  };

  const openPicker = () => {
    setJournals(listJournals());
    setPickerOpen(true);
  };

  const convert = (journalId: string | null) => {
    const ids = items.map((i) => i.id);
    const jid = convertTrayToJournal(journalId, ids);
    setPickerOpen(false);
    refresh();
    if (jid) router.push(`/journal/${jid}`);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Bandeja de recuerdos</Text>
          <Text style={styles.subtitle}>
            {items.length === 0
              ? 'Captura algo y conviértelo en página luego'
              : `${items.length} ${items.length === 1 ? 'captura' : 'capturas'}`}
          </Text>
        </View>
      </View>

      {/* Capturar */}
      <View style={styles.capture}>
        <Pressable style={styles.capBtn} onPress={addPhoto}>
          <Text style={styles.capText}>＋ Foto</Text>
        </Pressable>
        <Pressable style={styles.capBtn} onPress={() => setTextOpen(true)}>
          <Text style={styles.capText}>＋ Nota</Text>
        </Pressable>
        <Pressable style={styles.capBtn} onPress={() => setRecOpen(true)}>
          <Text style={styles.capText}>＋ Voz</Text>
        </Pressable>
        <Pressable style={styles.capBtn} onPress={addVideo}>
          <Text style={styles.capText}>＋ Vídeo</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {items.length === 0 ? (
          <Text style={styles.empty}>
            Tu bandeja está vacía. Guarda fotos, notas, voz o vídeos durante el día
            y conviértelos en una página cuando quieras.
          </Text>
        ) : (
          items.map((it) => (
            <View key={it.id} style={styles.card}>
              {it.kind === 'photo' ? (
                <Image source={{ uri: it.uri }} style={styles.thumb} contentFit="cover" />
              ) : it.kind === 'video' ? (
                <View style={[styles.thumb, styles.thumbDark]}>
                  <Text style={styles.thumbIcon}>►</Text>
                </View>
              ) : it.kind === 'audio' ? (
                <View style={[styles.thumb, styles.thumbAccent]}>
                  <Text style={styles.thumbIcon}>🎙</Text>
                </View>
              ) : (
                <View style={[styles.thumb, styles.thumbPaper]}>
                  <Text style={styles.thumbIcon}>✎</Text>
                </View>
              )}

              <View style={styles.cardBody}>
                <Text style={styles.cardKind}>
                  {it.kind === 'photo'
                    ? 'Foto'
                    : it.kind === 'video'
                      ? 'Vídeo'
                      : it.kind === 'audio'
                        ? `Nota de voz · ${fmt(it.durationMs)}`
                        : 'Nota'}
                </Text>
                {it.kind === 'text' && (
                  <Text style={styles.cardText} numberOfLines={2}>
                    {it.text}
                  </Text>
                )}
              </View>

              <Pressable onPress={() => remove(it.id)} hitSlop={8} style={styles.del}>
                <Text style={styles.delText}>✕</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.footer}>
          <Pressable style={styles.convertBtn} onPress={openPicker}>
            <Text style={styles.convertText}>Convertir en página</Text>
          </Pressable>
        </View>
      )}

      {/* Selector de libreta destino */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>¿Dónde lo guardamos?</Text>

            <Pressable style={styles.newRow} onPress={() => convert(null)}>
              <Text style={styles.newRowText}>＋ Nueva libreta</Text>
            </Pressable>

            <ScrollView style={{ maxHeight: 320 }}>
              {journals.map((j) => (
                <Pressable
                  key={j.id}
                  style={styles.journalRow}
                  onPress={() => convert(j.id)}
                >
                  <View style={[styles.dot, { backgroundColor: j.coverColor }]} />
                  <Text style={styles.journalTitle} numberOfLines={1}>
                    {j.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <AudioRecorderModal
        visible={recOpen}
        onSave={saveAudio}
        onCancel={() => setRecOpen(false)}
      />
      <TextEditorModal
        visible={textOpen}
        value={draft}
        onChangeText={setDraft}
        onSave={saveText}
        onCancel={() => setTextOpen(false)}
        title="Nota rápida"
        placeholder="Escribe una idea…"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paperCream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 4,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 34, lineHeight: 34, color: colors.ink },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 13, color: colors.inkMuted, marginTop: 1 },
  capture: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  capBtn: {
    backgroundColor: colors.paperLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.kraftMuted,
  },
  capText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  list: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 24, gap: 10 },
  empty: {
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingTop: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paperLight,
    borderRadius: radius.md,
    padding: 10,
    gap: 12,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: colors.kraftLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbDark: { backgroundColor: colors.ink },
  thumbAccent: { backgroundColor: colors.rose },
  thumbPaper: { backgroundColor: colors.paperCream },
  thumbIcon: { fontSize: 22, color: colors.white },
  cardBody: { flex: 1 },
  cardKind: { fontSize: 14, fontWeight: '700', color: colors.ink },
  cardText: { fontSize: 14, color: colors.inkMuted, marginTop: 2 },
  del: { padding: 6 },
  delText: { fontSize: 16, color: colors.inkMuted },
  footer: { paddingHorizontal: 16, paddingTop: 8 },
  convertBtn: {
    backgroundColor: colors.rose,
    borderRadius: radius.pill,
    paddingVertical: 15,
    alignItems: 'center',
  },
  convertText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(33,31,27,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.paperLight,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 8,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.kraftMuted,
    marginBottom: 6,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  newRow: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.rose,
  },
  newRowText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  journalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  dot: { width: 18, height: 18, borderRadius: 9 },
  journalTitle: { fontSize: 15, fontWeight: '600', color: colors.ink, flex: 1 },
});
