# Modelo de datos, persistencia y backup

> Última actualización: 2026-06-27.

## Estado de la implementación

Implementado en `src/data/models/journal.ts` (tipos) y
`src/data/storage/journalStorage.ts` (API `File`/`Directory` de expo-file-system SDK 54).
Ya **multi-journal** con la estructura por carpetas `journals/<id>/journal.json` + `media/`.
Funciones: `listJournals`, `createJournal`, `loadJournal`, `saveJournal`, `deleteJournal`,
`persistImage`. `rotation` en **radianes**; media con `uri` absoluta (las rutas relativas
llegan con el backup). Autoguardado con debounce; carga por id.

Navegación (expo-router): `app/index.tsx` = estantería (home), `app/journal/[id].tsx` =
editor del lienzo. La home recarga la lista con `useFocusEffect` al volver del editor.

Cada elemento guarda `width`/`height` (redimensionado libre con tirador, compensando
escala y rotación). Las fotos guardan `frame` (catálogo en `features/library/data/frames.ts`).
El journal guarda `background` (`color` + `pattern`: liso/cuadrícula/líneas). `normalize()`
en el editor rellena estos campos en journals antiguos.

## Principio

Todo es **local en el dispositivo**. Cada journal se guarda como una **carpeta** que
contiene su JSON y su media. El **formato de guardado ES el formato de backup**: exportar
es comprimir esa carpeta; importar es descomprimirla. Cero código duplicado.

## Layout en disco

```
documentDirectory/
└─ journals/
   └─ <journalId>/
      ├─ journal.json        # estructura completa: páginas, nodos, posiciones, textos
      ├─ cover.jpg           # miniatura de portada (opcional)
      └─ media/
         ├─ <mediaId>.jpg
         └─ <mediaId>.jpg
```

- En `journal.json` **nunca** se guardan rutas absolutas, solo `mediaId`. La ruta real se
  resuelve en runtime (`.../journals/<journalId>/media/<mediaId>.jpg`). Las rutas
  absolutas cambian entre dispositivos y reinstalaciones.
- **Todos los IDs son UUID** (journal, página, nodo, media). Es lo que permite importar en
  otro móvil sin colisiones y habilita merges en el futuro.

## Esquema de `journal.json` (borrador v1)

```jsonc
{
  "schemaVersion": 1,
  "id": "j_3f1c...",
  "title": "Verano 2026",
  "createdAt": "2026-06-27T10:00:00Z",
  "updatedAt": "2026-06-27T10:30:00Z",
  "pages": [
    {
      "id": "p_a1...",
      "background": { "type": "paper", "ref": "kraft-01" },
      "size": { "width": 1080, "height": 1920 },
      "nodes": [
        {
          "id": "n_01...",
          "type": "photo",            // photo | text | sticker | washi
          "mediaId": "m_77...",       // solo para photo
          "transform": { "x": 120, "y": 240, "scale": 1.0, "rotation": -4, "z": 1 },
          "style": { "borderRadius": 8, "shadow": "soft" }
        },
        {
          "id": "n_02...",
          "type": "text",
          "text": "Nuestro primer viaje",
          "transform": { "x": 80, "y": 900, "scale": 1, "rotation": 0, "z": 2 },
          "style": { "fontFamily": "Caveat", "fontSize": 32, "color": "#3b3a36" }
        }
      ]
    }
  ]
}
```

### Tipos de nodo (v1)

- `photo` → referencia a `mediaId`, transform, estilo (borde, sombra).
- `text` → contenido + tipografía/color/tamaño.
- `sticker` → `ref` al catálogo de assets.
- `washi` → `ref` + longitud/ángulo (se estira a lo largo).

> Fuera de la v1: `video`, `audio`, `drawing` (a mano alzada). Ver [04-roadmap](04-roadmap.md).

## Versionado

`schemaVersion` desde el día 1. Cuando cambie el modelo, se escribe una **migración**
forward-compatible que actualiza JSON viejos al cargar. Así los backups antiguos siguen
abriendo.

## Backup: el archivo `.reminly`

Un `.reminly` es un **zip** con esta forma:

```
manifest.json     # { schemaVersion, exportedAt, appVersion, journals: [...metadatos] }
journals/
  <journalId>/
    journal.json
    media/*.jpg
```

### Exportar

1. Serializar a JSON (ya está en disco) + recoger su carpeta `media`.
2. Comprimir en zip con extensión `.reminly`.
3. `expo-sharing` → compartir (Drive, WhatsApp, AirDrop, etc.).

Dos alcances con la misma maquinaria: **backup completo** (toda la app) y **export de un
journal** suelto.

### Importar

1. `expo-document-picker` → seleccionar `.reminly`.
2. Descomprimir y validar `schemaVersion` (migrar si hace falta).
3. **Política: importar como copia nueva** → se generan UUID nuevos para journal/páginas/
   nodos/media y se reescriben las referencias. No pisa nada existente. Es lo más seguro y
   predecible para "pasar a otro móvil".
   - Alternativa futura: modo "restaurar" que reemplaza por ID.

## ⚠️ Riesgos a vigilar

- **Tamaño de media.** Vídeos/fotos sin comprimir llenan el almacenamiento y generan
  exports de cientos de MB. **Comprimir siempre al capturar** (`expo-image-manipulator`) y
  avisar del peso antes de exportar.
- **Integridad del zip.** Validar `manifest.json` y que cada `mediaId` referenciado exista
  antes de dar el import por bueno.
