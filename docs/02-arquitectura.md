# Arquitectura y estructura

> Estado real. Última actualización: 2026-06-29.

## Estructura de carpetas

Organización **por features**. La estructura se ha limpiado de los restos de la plantilla
Expo; solo queda código en uso.

```
src/
├─ app/                          # Pantallas (expo-router)
│  ├─ _layout.tsx                #   Stack raíz + carga de fuentes
│  ├─ index.tsx                  #   Estantería de libretas (home)
│  ├─ tray.tsx                   #   Bandeja de recuerdos
│  └─ journal/[id].tsx           #   Editor del lienzo
├─ features/
│  ├─ canvas/components/         # Manipulable, PaperBackground, WashiStrip,
│  │                             #   VideoElement, AudioNote, AudioRecorderModal,
│  │                             #   TextEditorModal
│  ├─ journal/                   # CoverEditor, NotebookCover + data/covers
│  └─ library/                   # LibrarySheet + data/{stickers,washi,frames}
├─ core/theme/                   # tokens, palette, fonts (design system)
└─ data/
   ├─ models/                    # journal.ts, tray.ts (tipos de dominio)
   ├─ storage/                   # journalStorage, trayStorage (FileSystem)
   └─ media.ts                   # compresión + borrado de EXIF
```

## Capas

- **`app/`** — pantallas y orquestación; mantienen el estado de la pantalla.
- **`features/`** — UI agrupada por funcionalidad. `canvas` es el núcleo; `Manipulable`
  encapsula todos los gestos y reporta la transformación al soltar.
- **`core/theme`** — fuente única de design tokens (`tokens`, `palette`, `fonts`).
- **`data/`** — modelo de dominio + persistencia local; nada de UI aquí.

## Flujo de datos

```
gesto (reanimated) → estado del lienzo (useState en el editor)
                                   │
              autoguardado (debounce 600ms) ──▶ data/storage ──▶ journals/<id>/journal.json
```

El editor también **fuerza el guardado** al pulsar atrás y al pasar la app a segundo plano.

## Navegación

- `/` estantería · `/tray` bandeja · `/journal/[id]` editor.
- La home recarga su lista con `useFocusEffect` al volver.
- El editor intercepta el **botón atrás de Android** para cerrar modales/selección antes de salir.
