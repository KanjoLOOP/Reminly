# Registro de decisiones (ADR ligero)

> Cada decisión importante con su contexto y motivo. Añadir nuevas al final.
> Última actualización: 2026-06-27.

## ADR-001 — Plataforma: móvil nativo con Expo
**Decisión:** App móvil nativa (Android primero), con Expo managed + EAS.
**Motivo:** La experiencia (lienzo táctil, fotos, gestos) es intrínsecamente móvil. Expo
es el camino más corto a Play Store para un perfil junior en solitario.
**Descartado:** Web/PWA (gestos y cámara limitados), bare RN (fricción sin beneficio).

## ADR-002 — Sin cloud, todo local
**Decisión:** Sin backend, sin cuentas, sin AWS/Supabase. Datos en el dispositivo.
**Motivo:** El usuario quiere privacidad y simplicidad; elimina coste y superficie de
seguridad. El aprendizaje de cloud se pospone.
**Implicación:** El backup se resuelve con export/import de archivo (ver ADR-004).

## ADR-003 — Canvas sin Skia en el MVP
**Decisión:** El lienzo se construye con gesture-handler + reanimated sobre Views de RN.
Skia se reserva para el dibujo a mano alzada en una fase futura.
**Motivo:** Un engine Skia desde cero es trabajo de senior. Con Views + Reanimated se logra
el ~80% del resultado con mucha menos dificultad y abundante documentación.
**Implicación:** Sin filtros avanzados ni freehand en v1.

## ADR-004 — Persistencia: JSON por journal = formato de backup
**Decisión:** Cada journal es una carpeta con `journal.json` + `/media`. El backup
`.reminly` es un zip de esa estructura. Nada de SQLite por ahora.
**Motivo:** El formato de guardado coincide con el de backup → cero duplicación, flujo
fácil de entender. SQLite añade conceptos innecesarios en esta fase.
**Revisión futura:** migrar a `expo-sqlite` si el rendimiento lo exige.

## ADR-005 — Sin IA en el MVP
**Decisión:** La IA (composición, auto-organizar, estética) queda fuera del alcance inicial.
**Motivo:** Foco en validar la experiencia base del lienzo. La IA siempre será ayuda
opcional, nunca el elemento principal.

## ADR-006 — Alcance de la v1
**Decisión:** v1 = fotos, texto, stickers, washi y papeles. Fuera: vídeo, audio, dibujo.
**Motivo:** Vídeo/audio en el lienzo disparan la dificultad (reproducción, miniaturas,
rendimiento). Un scrapbook con foto+texto+decoración ya es publicable.

## ADR-007 — Multimedia dentro de Expo Go
**Decisión:** GIF (expo-image), notas de voz (expo-audio) y vídeo en bucle silenciado
(expo-video). El vídeo va **sin recorte** a 5s ni boomerang.
**Motivo:** GIF/audio/vídeo-bucle funcionan en Expo Go sin salir del entorno. Recortar a 5s o
hacer boomerang necesita ffmpeg → development build, que se pospone.

## ADR-008 — Backup con zip en JS (fflate)
**Decisión:** El `.reminly` se genera con `fflate` (zip puro en JS), no con un módulo nativo
de zip.
**Motivo:** Funciona en Expo Go (sin módulos nativos). Lectura/escritura de bytes con la API
síncrona `File.bytesSync()`/`write()`.

## ADR-009 — Bottom sheet propio (no @gorhom)
**Decisión:** Los paneles usan un `Modal` propio; se descartó `@gorhom/bottom-sheet`.
**Motivo:** La migración a gorhom dio problemas en este setup y bloqueaba el avance. El sheet
propio cumple. Reabrible en el futuro si se quiere el gesto nativo de arrastre.

## ADR-010 — Procesado de imágenes por privacidad y peso
**Decisión:** Las fotos se comprimen y se les **quitan los metadatos EXIF** (geolocalización
incluida) al añadirlas, con expo-image-manipulator. Los GIF no se tocan.
**Motivo:** Privacidad (no compartir dónde se tomó una foto al exportar) + menos peso de
almacenamiento y de los export.

## ADR-011 — "Lock" al manipular
**Decisión:** Tocar un elemento lo selecciona; solo el seleccionado responde a
mover/escalar/rotar. El resto solo se selecciona con un toque.
**Motivo:** Evita que un toque accidental sobre otro elemento interrumpa o cambie lo que
estás manipulando.

## ADR-012 — Paleta de color compartida
**Decisión:** Un único array `core/theme/palette.ts` (24 colores) alimenta portadas, papeles,
color de texto y color de líneas.
**Motivo:** Variedad y coherencia desde un solo sitio; ampliar es añadir colores ahí.

---

### Plantilla para nuevas decisiones

```
## ADR-00X — Título
**Decisión:** ...
**Motivo:** ...
**Descartado / Implicación / Revisión futura:** ...
```
