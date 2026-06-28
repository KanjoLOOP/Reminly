import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, typography } from '../core/theme/tokens';
import type { JournalSummary } from '../data/models/journal';
import {
  createJournal,
  deleteJournal,
  listJournals,
} from '../data/storage/journalStorage';

// Pequeña inclinación alterna para dar aire de "colocado a mano".
const tilt = (i: number) => (i % 2 === 0 ? -1.5 : 1.5);

export default function Home() {
  const router = useRouter();
  const [journals, setJournals] = useState<JournalSummary[]>([]);

  useFocusEffect(
    useCallback(() => {
      setJournals(listJournals());
    }, [])
  );

  const createNew = () => {
    const j = createJournal('Nuevo recuerdo');
    router.push(`/journal/${j.id}`);
  };

  const confirmDelete = (item: JournalSummary) => {
    Alert.alert(
      'Borrar libreta',
      `¿Borrar "${item.title}"? No se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: () => {
            deleteJournal(item.id);
            setJournals(listJournals());
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>Mis recuerdos</Text>
        <Text style={styles.subtitle}>
          {journals.length === 0
            ? 'Aún no tienes ninguna libreta'
            : `${journals.length} ${journals.length === 1 ? 'libreta' : 'libretas'}`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        <Pressable style={styles.newCard} onPress={createNew}>
          <Text style={styles.plus}>＋</Text>
          <Text style={styles.newText}>Nueva libreta</Text>
        </Pressable>

        {journals.map((j, i) => (
          <Pressable
            key={j.id}
            style={[styles.slot, { transform: [{ rotate: `${tilt(i)}deg` }] }]}
            onPress={() => router.push(`/journal/${j.id}`)}
            onLongPress={() => confirmDelete(j)}
          >
            {/* Portada de libreta */}
            <View style={[styles.book, { backgroundColor: j.bgColor }]}>
              <View style={styles.spine} />

              {j.coverUri ? (
                <View style={styles.tapedPhoto}>
                  <View style={styles.washiTape} />
                  <Image source={{ uri: j.coverUri }} style={styles.coverImg} />
                </View>
              ) : (
                <Text style={styles.coverDoodle}>✎</Text>
              )}

              <Text style={styles.bookTitle} numberOfLines={2}>
                {j.title}
              </Text>
            </View>

            <Text style={styles.cardMeta}>
              {j.count} {j.count === 1 ? 'elemento' : 'elementos'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paperCream,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 30,
    color: colors.ink,
    fontFamily: typography.handwritingBold,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    paddingBottom: 32,
    gap: 18,
    justifyContent: 'space-between',
  },
  slot: {
    width: '46%',
    alignItems: 'center',
  },
  book: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    paddingTop: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 12,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: 'rgba(59,58,54,0.16)',
  },
  tapedPhoto: {
    marginTop: 6,
    padding: 6,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 3,
    transform: [{ rotate: '-3deg' }],
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  washiTape: {
    position: 'absolute',
    top: -7,
    alignSelf: 'center',
    width: 46,
    height: 16,
    backgroundColor: 'rgba(232,165,152,0.85)',
    transform: [{ rotate: '4deg' }],
    borderRadius: 2,
    zIndex: 2,
  },
  coverImg: {
    width: 92,
    height: 92,
    borderRadius: 2,
    backgroundColor: colors.kraftLight,
  },
  coverDoodle: {
    fontSize: 56,
    color: 'rgba(59,58,54,0.18)',
    marginTop: 28,
  },
  bookTitle: {
    marginTop: 'auto',
    marginBottom: 14,
    fontSize: 26,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.ink,
    fontFamily: typography.handwritingBold,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 8,
  },
  newCard: {
    width: '46%',
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperLight,
    borderWidth: 2,
    borderColor: colors.kraftMuted,
    borderStyle: 'dashed',
  },
  plus: {
    fontSize: 44,
    color: colors.rose,
    fontWeight: '300',
  },
  newText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.inkMuted,
    marginTop: 4,
  },
});
