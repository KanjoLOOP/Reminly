import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoverEditor } from '../features/journal/components/CoverEditor';
import { NotebookCover } from '../features/journal/components/NotebookCover';
import { colors, typography } from '../core/theme/tokens';
import {
  CoverStyle,
  DEFAULT_COVER,
  JournalSummary,
} from '../data/models/journal';
import {
  createJournal,
  deleteJournal,
  exportJournal,
  importJournal,
  listJournals,
  setJournalCover,
} from '../data/storage/journalStorage';

const tilt = (i: number) => (i % 2 === 0 ? -1.5 : 1.5);

type EditorState =
  | { mode: 'create' }
  | { mode: 'edit'; target: JournalSummary }
  | null;

export default function Home() {
  const router = useRouter();
  const [journals, setJournals] = useState<JournalSummary[]>([]);
  const [editor, setEditor] = useState<EditorState>(null);

  const refresh = () => setJournals(listJournals());

  useFocusEffect(useCallback(() => refresh(), []));

  const confirmCover = (color: string, style: CoverStyle) => {
    if (editor?.mode === 'create') {
      const j = createJournal('Nuevo recuerdo', { color, style });
      setEditor(null);
      router.push(`/journal/${j.id}`);
    } else if (editor?.mode === 'edit') {
      setJournalCover(editor.target.id, { color, style });
      setEditor(null);
      refresh();
    }
  };

  const removeJournal = () => {
    if (editor?.mode === 'edit') {
      deleteJournal(editor.target.id);
      setEditor(null);
      refresh();
    }
  };

  const exportTarget = () => {
    if (editor?.mode === 'edit') {
      const tid = editor.target.id;
      setEditor(null);
      exportJournal(tid);
    }
  };

  const doImport = async () => {
    const newId = await importJournal();
    refresh();
    if (newId) router.push(`/journal/${newId}`);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Mis recuerdos</Text>
          <Text style={styles.subtitle}>
            {journals.length === 0
              ? 'Aún no tienes ninguna libreta'
              : `${journals.length} ${journals.length === 1 ? 'libreta' : 'libretas'}`}
          </Text>
        </View>
        <Pressable style={styles.importBtn} onPress={doImport} hitSlop={8}>
          <Text style={styles.importText}>Importar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        <Pressable style={styles.newCard} onPress={() => setEditor({ mode: 'create' })}>
          <Text style={styles.plus}>＋</Text>
          <Text style={styles.newText}>Nueva libreta</Text>
        </Pressable>

        {journals.map((j, i) => (
          <Pressable
            key={j.id}
            style={[styles.slot, { transform: [{ rotate: `${tilt(i)}deg` }] }]}
            onPress={() => router.push(`/journal/${j.id}`)}
            onLongPress={() => setEditor({ mode: 'edit', target: j })}
          >
            <NotebookCover
              color={j.coverColor}
              style={j.coverStyle}
              title={j.title}
              coverUri={j.coverUri}
            />
            <Text style={styles.cardMeta}>
              {j.count} {j.count === 1 ? 'elemento' : 'elementos'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <CoverEditor
        visible={editor !== null}
        mode={editor?.mode ?? 'create'}
        title={editor?.mode === 'edit' ? editor.target.title : 'Nuevo recuerdo'}
        coverUri={editor?.mode === 'edit' ? editor.target.coverUri : undefined}
        initialColor={
          editor?.mode === 'edit' ? editor.target.coverColor : DEFAULT_COVER.color
        }
        initialStyle={
          editor?.mode === 'edit' ? editor.target.coverStyle : DEFAULT_COVER.style
        }
        onConfirm={confirmCover}
        onClose={() => setEditor(null)}
        onDelete={removeJournal}
        onExport={exportTarget}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paperCream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  importBtn: {
    backgroundColor: colors.paperLight,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.kraftMuted,
  },
  importText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
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
    rowGap: 18,
    justifyContent: 'space-between',
  },
  slot: {
    width: '46%',
    alignItems: 'center',
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
