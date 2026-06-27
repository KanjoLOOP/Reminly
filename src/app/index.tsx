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

import { colors, radius } from '../core/theme/tokens';
import type { JournalSummary } from '../data/models/journal';
import {
  createJournal,
  deleteJournal,
  listJournals,
} from '../data/storage/journalStorage';

export default function Home() {
  const router = useRouter();
  const [journals, setJournals] = useState<JournalSummary[]>([]);

  // Recargar la lista cada vez que la pantalla recupera el foco.
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
      'Borrar journal',
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
        {/* Tarjeta de crear */}
        <Pressable style={[styles.card, styles.newCard]} onPress={createNew}>
          <Text style={styles.plus}>＋</Text>
          <Text style={styles.newText}>Nueva libreta</Text>
        </Pressable>

        {journals.map((j) => (
          <Pressable
            key={j.id}
            style={styles.card}
            onPress={() => router.push(`/journal/${j.id}`)}
            onLongPress={() => confirmDelete(j)}
          >
            <View style={styles.cover}>
              {j.coverUri ? (
                <Image source={{ uri: j.coverUri }} style={styles.coverImg} />
              ) : (
                <View style={styles.coverEmpty}>
                  <Text style={styles.coverEmptyText}>✎</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {j.title}
            </Text>
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: colors.paperLight,
    borderRadius: radius.lg,
    padding: 10,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },
  cover: {
    height: 150,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.kraftLight,
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  coverEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.kraft,
  },
  coverEmptyText: {
    fontSize: 40,
    color: colors.paperLight,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 1,
  },
  newCard: {
    height: 222,
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
