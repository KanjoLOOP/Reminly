# Modelo de datos, persistencia y backup

> Estado real. Última actualización: 2026-06-29.

## En disco

```
documentDirectory/
├─ journals/<journalId>/
│  ├─ journal.json        # estructura completa de la libreta
│  └─ media/<mediaId>.*   # fotos, gifs, vídeos, audios de esa libreta
└─ tray/
   ├─ tray.json           # capturas rápidas pendientes
   └─ media/<mediaId>.*
```

- IDs en todo. En `journal.json` solo se guardan `uri` de media; al importar se reapuntan
  a la carpeta de la libreta nueva.
- API síncrona `File`/`Directory` de expo-file-system (SDK 54).

## Journal (`data/models/journal.ts`)

```jsonc
{
  "schemaVersion": 1,
  "id": "...", "title": "...", "createdAt": "...", "updatedAt": "...",
  "cover": { "color": "#C9A77C", "style": "notebook|spiral|book" },
  "background": { "color": "#FBF7F0", "pattern": "blank|grid|lines", "lineColor": "#3B3A36" },
  "items": [ /* CanvasItem[] */ ]
}
```

### Elementos del lienzo (`CanvasItem`)

Todos comparten `id`, transform (`x, y, scale, rotation` en radianes) y `width/height`.

- **photo** — `uri`, `frame` (id de marco)
- **text** — `text`, `font` (familia), `color`
- **sticker** — `emoji`
- **washi** — `style` (id de cinta)
- **audio** — `uri`, `durationMs`
- **video** — `uri`

`normalize()` en el editor rellena campos que falten en libretas antiguas (cover, background,
lineColor, color de texto, frame, tamaños).

## Bandeja (`data/models/tray.ts`)

`TrayItem` = captura rápida: `photo` / `video` / `audio` (con `durationMs`) / `text`.
`convertTrayToJournal()` vuelca las capturas a una libreta (nueva o existente), copiando la
media a esa libreta y vaciando la bandeja.

## Privacidad de la media

Las fotos se procesan con `data/media.ts` antes de guardarse: se **comprimen** y se
**eliminan los metadatos EXIF** (incluida la geolocalización). Los GIF se respetan tal cual.
El vídeo no se reprocesa (requeriría ffmpeg).

## Backup `.reminly`

Zip (con `fflate`) que contiene `manifest.json`, `journal.json` y `media/`.

- **Exportar**: `exportJournal(id)` → zip → `expo-sharing`.
- **Importar**: `importJournal()` → `expo-document-picker` → unzip → libreta nueva con uris
  de media reapuntadas. Se **valida** el contenido (estructura, kinds conocidos, tope de
  elementos) por seguridad.
