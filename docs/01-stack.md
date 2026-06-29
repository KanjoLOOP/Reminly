# Stack técnico

> Estado real del proyecto. Última actualización: 2026-06-29.

## Resumen

| Capa | Elección | Notas |
|---|---|---|
| Framework | **Expo (managed) + TypeScript** | Build y publicación con EAS. Requiere **Node 20 LTS**. |
| Navegación | **expo-router** | Rutas por archivos en `src/app`. |
| Estado | React state local | El documento abierto vive en `useState`; no hizo falta un store global aún. |
| Gestos / animación | **react-native-gesture-handler** + **react-native-reanimated** | Mover/escalar/rotar/redimensionar en el hilo de UI. |
| Imágenes / GIF | **expo-image** | Render con cache; anima GIFs. |
| Selección de media | **expo-image-picker** | Fotos, GIFs y vídeos de la galería. |
| Procesado de imagen | **expo-image-manipulator** | Compresión + **borrado de EXIF** (privacidad). |
| Audio | **expo-audio** | Grabar y reproducir notas de voz. |
| Vídeo | **expo-video** | Reproducción en bucle, silenciado. |
| Persistencia | **expo-file-system** (API `File`/`Directory`, SDK 54) | Todo local. |
| Backup | **fflate** (zip JS puro) + **expo-sharing** + **expo-document-picker** | Export/import `.reminly` sin módulos nativos. |
| Bottom sheets | Modal propio | `@gorhom/bottom-sheet` se probó y se descartó (ver decisiones). |

## Principios

- **Local-first**: sin backend, sin cuentas, **sin ninguna llamada de red**. Privacidad por diseño.
- **Sin sobre-ingeniería**: se añade complejidad solo cuando hace falta.
- **Gestos en el hilo de UI** para que el lienzo vaya fluido.

## Decisión clave: canvas sin Skia

El lienzo se construye con `gesture-handler` + `reanimated` sobre `View`s normales, no con
un engine Skia. Da el resultado buscado con mucha menos complejidad. Skia se reservaría para
dibujo a mano alzada (no implementado).

## Pendiente / futuro

- Dibujo a mano alzada (requeriría Skia).
- Boomerang / recorte de vídeo a 5s (requeriría ffmpeg → development build).
- Buscador de GIFs (Giphy/Tenor) — ahora los GIFs salen de la galería.
