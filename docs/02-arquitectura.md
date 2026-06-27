# Arquitectura y estructura del proyecto

> Última actualización: 2026-06-27.

## Estructura de carpetas

Organización **por features**, no por tipo de archivo. La lógica del canvas se mantiene
separada de su render para poder testearla y, en el futuro, reutilizarla en web.

```
Reminly/
├─ app/                      # Pantallas (expo-router, file-based routing)
├─ src/
│  ├─ features/
│  │  ├─ canvas/             # NÚCLEO: lienzo libre
│  │  │  ├─ components/      #   elementos visuales (foto, texto, sticker, gizmos)
│  │  │  ├─ hooks/           #   useGesture, useSelection...
│  │  │  ├─ engine/          #   lógica PURA: transformaciones, serialización, z-order
│  │  │  └─ types/           #   tipos de nodos y página
│  │  ├─ library/            # Biblioteca de recursos (stickers, papeles, washi, fuentes)
│  │  │  ├─ components/
│  │  │  └─ data/            #   catálogo/índice de recursos
│  │  ├─ tray/               # Bandeja de recuerdos (quick capture)
│  │  │  └─ components/
│  │  ├─ journal/            # Lista de journals, páginas, miniaturas
│  │  │  ├─ components/
│  │  │  └─ hooks/
│  │  └─ backup/             # Export/import .reminly
│  ├─ core/
│  │  ├─ ui/                 # Componentes base (Button, Sheet, Icon...)
│  │  └─ theme/              # Design tokens, colores, tipografías, sombras
│  ├─ data/
│  │  ├─ models/             # Tipos de dominio (Journal, Page, Node, Media)
│  │  ├─ storage/            # Acceso a FileSystem: leer/escribir journal.json y media
│  │  └─ repositories/       # API de alto nivel (journalRepository, mediaRepository)
│  └─ lib/                   # Utilidades, helpers, constantes
├─ assets/
│  ├─ papers/                # Fondos de papel
│  ├─ stickers/              # Pegatinas
│  ├─ washi/                 # Cintas washi
│  ├─ fonts/                 # Tipografías manuscritas
│  └─ icons/                 # Iconografía de la UI
└─ docs/                     # Esta documentación
```

## Capas y responsabilidades

- **`features/*`** — todo lo que ve y toca el usuario, agrupado por funcionalidad.
- **`canvas/engine`** — **lógica pura y testeable**. No importa React Native. Convierte
  gestos en transformaciones y serializa la página a/desde JSON. Aquí vivirá undo/redo.
- **`core`** — design system y componentes reutilizables. Una sola fuente de verdad para
  colores, sombras y tipografías (ver [05-design-system](05-design-system.md)).
- **`data`** — persistencia. `storage` toca el FileSystem; `repositories` exponen una API
  limpia (`getJournal`, `savePage`, `importBundle`) sin que el resto sepa de archivos.

## Regla de oro

> El **canvas engine** debe poder serializar una página a JSON y reconstruirla, sin
> depender del render. Eso habilita tests, undo/redo y portabilidad futura a web.

## Flujo de datos (alto nivel)

```
Gesto (Reanimated) ──▶ actualiza nodo en el store (Zustand)
                                   │
                                   ▼
                   render del canvas (Views posicionadas)
                                   │
            guardado (debounced) ──▶ data/storage ──▶ journal.json + /media
```

El **formato de guardado coincide con el de backup**: exportar es comprimir la carpeta
del journal. Ver [03-modelo-datos](03-modelo-datos.md).
