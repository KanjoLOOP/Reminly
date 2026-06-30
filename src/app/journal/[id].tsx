import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Manipulable, Size } from '../../features/canvas/components/Manipulable';
import { PaperBackground } from '../../features/canvas/components/PaperBackground';
import { TextEditorModal } from '../../features/canvas/components/TextEditorModal';
import { WashiStrip } from '../../features/canvas/components/WashiStrip';
import { AudioNote } from '../../features/canvas/components/AudioNote';
import { AudioRecorderModal } from '../../features/canvas/components/AudioRecorderModal';
import { VideoElement } from '../../features/canvas/components/VideoElement';
import { LibrarySheet } from '../../features/library/components/LibrarySheet';
import { DEFAULT_FRAME, getFrame } from '../../features/library/data/frames';
import { DEFAULT_FONT } from '../../core/theme/fonts';
import { colors, radius } from '../../core/theme/tokens';
import { isGif, processPhoto } from '../../data/media';
import {
  CanvasItem,
  DEFAULT_BACKGROUND,
  DEFAULT_COVER,
  Journal,
  Page,
  PaperBackground as Bg,
  Transform,
} from '../../data/models/journal';
import {
  deleteJournal,
  loadJournal,
  persistImage,
  saveJournal,
} from '../../data/storage/journalStorage';

const nextId = () =>
  `it_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const PHOTO_W = 220;
const PHOTO_H = 280;
const TEXT_W = 240;
const TEXT_H = 80;
const STICKER = 90;
const WASHI_W = 170;
const WASHI_H = 34;
const AUDIO_W = 210;
const AUDIO_H = 64;
const VIDEO_W = 220;
const VIDEO_H = 280;

// Ajusta una imagen/vídeo a una caja máxima conservando su proporción,
// para que no se recorte al colocarlo.
function fitSize(aw?: number, ah?: number, maxW = 240, maxH = 300) {
  if (!aw || !ah) return { width: maxW, height: maxH };
  let w = maxW;
  let h = (maxW * ah) / aw;
  if (h > maxH) {
    h = maxH;
    w = (maxH * aw) / ah;
  }
  return { width: Math.round(w), height: Math.round(h) };
}

function defaultW(kind: CanvasItem['kind']) {
  switch (kind) {
    case 'photo':
      return PHOTO_W;
    case 'video':
      return VIDEO_W;
    case 'text':
      return TEXT_W;
    case 'washi':
      return WASHI_W;
    case 'audio':
      return AUDIO_W;
    default:
      return STICKER;
  }
}
function defaultH(kind: CanvasItem['kind']) {
  switch (kind) {
    case 'photo':
      return PHOTO_H;
    case 'video':
      return VIDEO_H;
    case 'text':
      return TEXT_H;
    case 'washi':
      return WASHI_H;
    case 'audio':
      return AUDIO_H;
    default:
      return STICKER;
  }
}

const pageId = () =>
  `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function normItem(i: CanvasItem): CanvasItem {
  const base = {
    ...i,
    width: i.width ?? defaultW(i.kind),
    height: i.height ?? defaultH(i.kind),
  };
  if (i.kind === 'photo')
    return { ...base, frame: (i as any).frame ?? DEFAULT_FRAME.id } as CanvasItem;
  if (i.kind === 'text')
    return { ...base, color: (i as any).color ?? '#3B3A36' } as CanvasItem;
  return base as CanvasItem;
}

// Acepta libretas nuevas (pages) y antiguas (items/background en raíz).
function normalize(j: Journal & { items?: CanvasItem[]; background?: Bg }): Journal {
  const rawPages: { id?: string; background?: Bg; items?: CanvasItem[] }[] =
    Array.isArray(j.pages)
      ? j.pages
      : Array.isArray(j.items)
        ? [{ background: j.background, items: j.items }]
        : [{ items: [] }];

  const pages: Page[] = rawPages.map((p) => ({
    id: p?.id || pageId(),
    background: { ...DEFAULT_BACKGROUND, ...(p?.background ?? {}) },
    items: (Array.isArray(p?.items) ? p.items : []).map(normItem),
  }));

  return {
    schemaVersion: j.schemaVersion ?? 1,
    id: j.id,
    title: j.title,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
    cover: j.cover ?? DEFAULT_COVER,
    pages: pages.length ? pages : [{ id: pageId(), background: { ...DEFAULT_BACKGROUND }, items: [] }],
  };
}

type LibTab = 'stickers' | 'papeles' | 'marcos' | 'tipografias';

export default function JournalEditor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [journal, setJournal] = useState<Journal | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const [libOpen, setLibOpen] = useState(false);
  const [libTab, setLibTab] = useState<LibTab>('stickers');
  const [recOpen, setRecOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const exitEditing = () => {
    setSelectedId(null);
    setEditing(false);
  };

  // Página actual: items y background son vistas derivadas; los setters
  // escriben sobre la página activa, así el resto del editor no cambia.
  const current = pages[pageIndex];
  const items = current?.items ?? [];
  const background = current?.background ?? DEFAULT_BACKGROUND;

  const setItems = (
    updater: CanvasItem[] | ((prev: CanvasItem[]) => CanvasItem[])
  ) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === pageIndex
          ? {
              ...p,
              items: typeof updater === 'function' ? updater(p.items) : updater,
            }
          : p
      )
    );
  };

  const setBackground = (bg: Bg) => {
    setPages((prev) =>
      prev.map((p, i) => (i === pageIndex ? { ...p, background: bg } : p))
    );
  };

  const goToPage = (i: number) => {
    setSelectedId(null);
    setPageIndex(Math.max(0, Math.min(pages.length - 1, i)));
  };

  const addPage = () => {
    setSelectedId(null);
    setPages((prev) => {
      const copy = [...prev];
      copy.splice(pageIndex + 1, 0, {
        id: pageId(),
        background: { ...DEFAULT_BACKGROUND },
        items: [],
      });
      return copy;
    });
    setPageIndex(pageIndex + 1);
  };

  const deletePage = () => {
    if (pages.length <= 1) return;
    Alert.alert('Borrar página', '¿Borrar esta página? No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          setSelectedId(null);
          setPages((prev) => prev.filter((_, i) => i !== pageIndex));
          setPageIndex(Math.min(pageIndex, pages.length - 2));
        },
      },
    ]);
  };

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    const j = loadJournal(id);
    if (j) {
      const norm = normalize(j);
      setJournal(norm);
      setPages(norm.pages);
      setPageIndex(0);
    }
    setLoaded(true);
  }, [id]);

  useEffect(() => {
    if (!loaded || !journal) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveJournal({ ...journal, pages }), 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [pages, journal, loaded]);

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const activate = (itemId: string) => {
    setSelectedId(itemId);
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === itemId);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const copy = [...prev];
      const [picked] = copy.splice(idx, 1);
      copy.push(picked);
      return copy;
    });
  };

  const sendToBack = (itemId: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === itemId);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const [picked] = copy.splice(idx, 1);
      copy.unshift(picked);
      return copy;
    });
  };

  const deleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setSelectedId(null);
  };

  const updateTransform = (itemId: string, t: Transform) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...t } : i)));
  };

  const updateSize = (itemId: string, s: Size) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...s } : i)));
  };

  const setFont = (family: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedId && i.kind === 'text' ? { ...i, font: family } : i
      )
    );
  };

  const setTextColor = (color: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedId && i.kind === 'text' ? { ...i, color } : i
      )
    );
  };

  const setFrame = (frame: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === selectedId && i.kind === 'photo' ? { ...i, frame } : i
      )
    );
  };

  const addPhoto = async () => {
    if (!id) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!res.canceled) {
      const a = res.assets[0];
      const processed = await processPhoto(a.uri, {
        gif: isGif(a.uri, a.mimeType),
        width: a.width,
      });
      const uri = persistImage(id, processed);
      const { width, height } = fitSize(a.width, a.height);
      const itemId = nextId();
      setItems((prev) => [
        ...prev,
        {
          id: itemId,
          kind: 'photo',
          uri,
          frame: DEFAULT_FRAME.id,
          x: 90,
          y: 260,
          width,
          height,
          scale: 1,
          rotation: 0.05,
        },
      ]);
      setSelectedId(itemId);
    }
  };

  const addText = () => {
    const itemId = nextId();
    setItems((prev) => [
      ...prev,
      {
        id: itemId,
        kind: 'text',
        text: '',
        font: DEFAULT_FONT.family,
        color: '#3B3A36',
        x: 80,
        y: 200,
        width: TEXT_W,
        height: TEXT_H,
        scale: 1,
        rotation: 0,
      },
    ]);
    setSelectedId(itemId);
    setDraft('');
    setEditingId(itemId);
  };

  const addSticker = (emoji: string) => {
    const itemId = nextId();
    setItems((prev) => [
      ...prev,
      {
        id: itemId,
        kind: 'sticker',
        emoji,
        x: 140,
        y: 300,
        width: STICKER,
        height: STICKER,
        scale: 1,
        rotation: 0,
      },
    ]);
    setSelectedId(itemId);
  };

  const addWashi = (style: string) => {
    const itemId = nextId();
    // Se inserta al fondo (índice 0) → queda detrás como capa decorativa.
    setItems((prev) => [
      {
        id: itemId,
        kind: 'washi',
        style,
        x: 60,
        y: 340,
        width: WASHI_W,
        height: WASHI_H,
        scale: 1,
        rotation: -0.12,
      },
      ...prev,
    ]);
    setSelectedId(itemId);
  };

  const addVideo = async () => {
    if (!id) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (!res.canceled) {
      const a = res.assets[0];
      const uri = persistImage(id, a.uri);
      const { width, height } = fitSize(a.width, a.height);
      const itemId = nextId();
      setItems((prev) => [
        ...prev,
        {
          id: itemId,
          kind: 'video',
          uri,
          x: 90,
          y: 240,
          width,
          height,
          scale: 1,
          rotation: 0.03,
        },
      ]);
      setSelectedId(itemId);
    }
  };

  const onSaveAudio = (uri: string, durationMs: number) => {
    setRecOpen(false);
    if (!id) return;
    const persisted = persistImage(id, uri);
    const itemId = nextId();
    setItems((prev) => [
      ...prev,
      {
        id: itemId,
        kind: 'audio',
        uri: persisted,
        durationMs,
        x: 80,
        y: 300,
        width: AUDIO_W,
        height: AUDIO_H,
        scale: 1,
        rotation: 0,
      },
    ]);
    setSelectedId(itemId);
  };

  const openLibrary = () => {
    setLibTab(
      selectedItem?.kind === 'text'
        ? 'tipografias'
        : selectedItem?.kind === 'photo'
          ? 'marcos'
          : 'stickers'
    );
    setLibOpen(true);
  };

  const openEditor = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item?.kind === 'text') {
      setDraft(item.text);
      setEditingId(itemId);
    }
  };

  const saveText = () => {
    if (!editingId) return;
    const text = draft.trim();
    if (text.length === 0) {
      deleteItem(editingId);
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingId && i.kind === 'text' ? { ...i, text } : i
        )
      );
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    if (!editingId) return;
    const item = items.find((i) => i.id === editingId);
    if (item?.kind === 'text' && item.text.length === 0) {
      deleteItem(editingId);
    }
    setEditingId(null);
  };

  // Al salir, si la libreta quedó vacía (creada y sin usar), se descarta.
  const goBack = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const totalItems = pages.reduce((n, p) => n + p.items.length, 0);
    if (id && totalItems === 0) {
      deleteJournal(id);
    } else if (journal) {
      saveJournal({ ...journal, pages });
    }
    router.back();
  };

  const openRename = () => {
    setTitleDraft(journal?.title ?? '');
    setRenaming(true);
  };

  const saveRename = () => {
    const title = titleDraft.trim();
    if (journal && title.length > 0) setJournal({ ...journal, title });
    setRenaming(false);
  };

  // Botón atrás de Android: cierra modales/selección antes de salir.
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (editingId !== null) {
          cancelEdit();
          return true;
        }
        if (renaming) {
          setRenaming(false);
          return true;
        }
        if (recOpen) {
          setRecOpen(false);
          return true;
        }
        if (libOpen) {
          setLibOpen(false);
          return true;
        }
        if (selectedId) {
          setSelectedId(null);
          return true;
        }
        if (editing) {
          exitEditing();
          return true;
        }
        goBack();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [editingId, renaming, recOpen, libOpen, selectedId, editing, items, journal, id])
  );

  // Guardar al pasar a segundo plano (por si el sistema mata la app).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && loaded && journal) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveJournal({ ...journal, pages });
      }
    });
    return () => sub.remove();
  }, [loaded, journal, pages]);

  return (
    <View style={[styles.screen, { backgroundColor: background.color }]}>
      <StatusBar style="dark" />

      <SafeAreaView edges={['top']} style={{ backgroundColor: background.color }}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Pressable style={styles.titleWrap} onPress={openRename} hitSlop={8}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {journal?.title ?? '…'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, editing && styles.modeBtnActive]}
            onPress={() => (editing ? exitEditing() : setEditing(true))}
            hitSlop={8}
          >
            <Text style={[styles.modeBtnText, editing && styles.modeBtnTextActive]}>
              {editing ? 'Hecho' : 'Editar'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Lienzo */}
      <View style={styles.canvas}>
        <PaperBackground
          color={background.color}
          pattern={background.pattern}
          lineColor={background.lineColor}
        />

        {editing && (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelectedId(null)}
          />
        )}

        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {items.map((item) => (
            <Manipulable
              key={item.id}
              transform={{
                x: item.x,
                y: item.y,
                scale: item.scale,
                rotation: item.rotation,
              }}
              size={{ width: item.width, height: item.height }}
              resizeMode={
                item.kind === 'photo' || item.kind === 'video'
                  ? 'both'
                  : item.kind === 'sticker' || item.kind === 'audio'
                    ? 'none'
                    : 'horizontal'
              }
              selected={selectedId === item.id}
              interactive={editing}
              onActivate={() =>
                item.kind === 'washi' ? setSelectedId(item.id) : activate(item.id)
              }
              onTransformEnd={(t) => updateTransform(item.id, t)}
              onResizeEnd={(s) => updateSize(item.id, s)}
            >
              {item.kind === 'photo' ? (
                <View style={[styles.frame, getFrame(item.frame).container]}>
                  <Image
                    source={{ uri: item.uri }}
                    style={[
                      styles.photo,
                      { borderRadius: getFrame(item.frame).imageRadius },
                    ]}
                    contentFit="cover"
                  />
                </View>
              ) : item.kind === 'text' ? (
                <Text
                  style={[
                    styles.handwriting,
                    { fontFamily: item.font, color: item.color },
                  ]}
                >
                  {item.text}
                </Text>
              ) : item.kind === 'sticker' ? (
                <View
                  style={[
                    styles.stickerBox,
                    { width: item.width, height: item.height },
                  ]}
                >
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
            </Manipulable>
          ))}
        </View>

        {loaded && items.length === 0 && (
          <View pointerEvents="none" style={styles.emptyHint}>
            <Text style={styles.emptyHintText}>
              {editing
                ? 'Toca ＋ Foto, ＋ Texto o la Biblioteca para empezar'
                : 'Pulsa Editar para empezar esta página'}
            </Text>
          </View>
        )}
      </View>

      {/* Barra inferior */}
      <SafeAreaView edges={['bottom']} style={styles.toolbarWrap} pointerEvents="box-none">
        {/* Navegación de páginas (siempre visible) */}
        <View style={styles.pageBar}>
          <Pressable
            onPress={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 0}
            style={styles.pageNav}
            hitSlop={6}
          >
            <Text style={[styles.pageNavText, pageIndex === 0 && styles.pageNavOff]}>
              ‹
            </Text>
          </Pressable>
          <Text style={styles.pageIndicator}>
            {pageIndex + 1} / {pages.length}
          </Text>
          <Pressable
            onPress={() => goToPage(pageIndex + 1)}
            disabled={pageIndex >= pages.length - 1}
            style={styles.pageNav}
            hitSlop={6}
          >
            <Text
              style={[
                styles.pageNavText,
                pageIndex >= pages.length - 1 && styles.pageNavOff,
              ]}
            >
              ›
            </Text>
          </Pressable>
          {editing && (
            <>
              <Pressable onPress={addPage} style={styles.pageAction} hitSlop={6}>
                <Text style={styles.pageActionText}>＋ Página</Text>
              </Pressable>
              {pages.length > 1 && (
                <Pressable onPress={deletePage} style={styles.pageAction} hitSlop={6}>
                  <Text style={styles.pageActionText}>🗑</Text>
                </Pressable>
              )}
            </>
          )}
          {!editing && (
            <Pressable
              onPress={() => router.push(`/present/${id}?page=${pageIndex}`)}
              style={styles.pageAction}
              hitSlop={6}
            >
              <Text style={styles.pageActionText}>▶ Presentar</Text>
            </Pressable>
          )}
        </View>

        {editing && (
        <View style={styles.toolbar}>
          {selectedItem ? (
            <>
              {selectedItem.kind === 'text' && (
                <Pressable
                  style={[styles.toolButton, styles.btnNeutral]}
                  onPress={() => openEditor(selectedItem.id)}
                >
                  <Text style={styles.btnNeutralText}>Editar</Text>
                </Pressable>
              )}
              {(selectedItem.kind === 'text' || selectedItem.kind === 'photo') && (
                <Pressable
                  style={[styles.toolButton, styles.btnNeutral]}
                  onPress={openLibrary}
                >
                  <Text style={styles.btnNeutralText}>Estilo</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.toolButton, styles.btnNeutral]}
                onPress={() => sendToBack(selectedItem.id)}
              >
                <Text style={styles.btnNeutralText}>Al fondo</Text>
              </Pressable>
              <Pressable
                style={[styles.toolButton, styles.btnDanger]}
                onPress={() => deleteItem(selectedItem.id)}
              >
                <Text style={styles.btnDangerText}>Borrar</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={[styles.toolButton, styles.btnAccent]}
                onPress={addPhoto}
              >
                <Text style={styles.btnAccentText}>＋ Foto</Text>
              </Pressable>
              <Pressable
                style={[styles.toolButton, styles.btnNeutral]}
                onPress={addText}
              >
                <Text style={styles.btnNeutralText}>＋ Texto</Text>
              </Pressable>
              <Pressable
                style={[styles.toolButton, styles.btnNeutral]}
                onPress={() => setRecOpen(true)}
              >
                <Text style={styles.btnNeutralText}>＋ Audio</Text>
              </Pressable>
              <Pressable
                style={[styles.toolButton, styles.btnNeutral]}
                onPress={addVideo}
              >
                <Text style={styles.btnNeutralText}>＋ Vídeo</Text>
              </Pressable>
              <Pressable
                style={[styles.toolButton, styles.btnNeutral]}
                onPress={openLibrary}
              >
                <Text style={styles.btnNeutralText}>Biblioteca</Text>
              </Pressable>
            </>
          )}
        </View>
        )}
      </SafeAreaView>

      <TextEditorModal
        visible={editingId !== null}
        value={draft}
        onChangeText={setDraft}
        onSave={saveText}
        onCancel={cancelEdit}
      />
      <TextEditorModal
        visible={renaming}
        value={titleDraft}
        onChangeText={setTitleDraft}
        onSave={saveRename}
        onCancel={() => setRenaming(false)}
        title="Título del journal"
        placeholder="Verano '26…"
      />
      <AudioRecorderModal
        visible={recOpen}
        onSave={onSaveAudio}
        onCancel={() => setRecOpen(false)}
      />
      <LibrarySheet
        visible={libOpen}
        onClose={() => setLibOpen(false)}
        initialTab={libTab}
        selectedKind={selectedItem?.kind ?? null}
        selectedFont={selectedItem?.kind === 'text' ? selectedItem.font : undefined}
        selectedFrame={selectedItem?.kind === 'photo' ? selectedItem.frame : undefined}
        selectedTextColor={
          selectedItem?.kind === 'text' ? selectedItem.color : undefined
        }
        background={background}
        onAddSticker={addSticker}
        onAddWashi={addWashi}
        onSetFont={setFont}
        onSetTextColor={setTextColor}
        onSetFrame={setFrame}
        onSetBackground={setBackground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 34, lineHeight: 34, color: colors.ink },
  titleWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.ink },
  modeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.paperLight,
    borderWidth: 1,
    borderColor: colors.kraftMuted,
  },
  modeBtnActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  modeBtnText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  modeBtnTextActive: { color: colors.white },
  canvas: { flex: 1, overflow: 'hidden' },
  emptyHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyHintText: {
    fontSize: 16,
    color: colors.inkMuted,
    textAlign: 'center',
    opacity: 0.7,
  },
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
  stickerBox: { alignItems: 'center', justifyContent: 'center' },
  sticker: { fontSize: 64 },
  toolbarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  pageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.paperLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginBottom: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  pageNav: { paddingHorizontal: 6 },
  pageNavText: { fontSize: 24, lineHeight: 26, color: colors.ink },
  pageNavOff: { color: colors.kraftMuted },
  pageIndicator: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    minWidth: 44,
    textAlign: 'center',
  },
  pageAction: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.paperCream,
  },
  pageActionText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '94%',
    backgroundColor: colors.paperLight,
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderRadius: radius.lg,
    marginBottom: 12,
    marginHorizontal: 12,
    gap: 6,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
  },
  toolButton: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: radius.pill,
  },
  btnAccent: { backgroundColor: colors.rose },
  btnAccentText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  btnNeutral: { backgroundColor: colors.paperCream },
  btnNeutralText: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  btnDanger: { backgroundColor: colors.roseDeep },
  btnDangerText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
