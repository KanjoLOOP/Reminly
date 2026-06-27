# Roadmap

> Orden pensado para atacar primero el mayor riesgo técnico (el canvas) y dejar lo demás
> como ensamblaje. Última actualización: 2026-06-27.

## Filosofía

No empezar por la biblioteca ni por el backup. **Si la manipulación con gestos no se
siente mágica, no hay producto.** Validamos eso primero; si funciona, el resto se suma.

## Fase 0 — Setup

- Scaffold Expo + TypeScript + expo-router.
- Estructura de carpetas (ver [02-arquitectura](02-arquitectura.md)).
- Configurar gesture-handler + reanimated.
- Git + convención de commits.

## Fase 1 — Spike del canvas ⭐ (mayor riesgo)

**Objetivo:** una pantalla con lienzo de papel donde añadir una **foto** y un **texto**,
**moverlos, escalarlos y rotarlos** con los dedos, con sombras suaves.
**Criterio de éxito:** se siente bien al tacto. Todo en memoria, sin guardar aún.

## Fase 2 — Engine + persistencia

- Serializar página ↔ `journal.json` (ver [03-modelo-datos](03-modelo-datos.md)).
- Guardar/cargar desde FileSystem (guardado con debounce).
- Lista de journals con miniaturas.
- Undo/redo en el engine.

## Fase 3 — Biblioteca de recursos

- Catálogo de stickers, papeles, washi y tipografías manuscritas, por categorías/estilos.
- Bottom sheet para arrastrar recursos al lienzo.

## Fase 4 — Bandeja de recuerdos

- Quick capture: guardar fotos/notas/capturas durante el día.
- "Convertir en página" → vuelca la bandeja a un journal (auto-layout simple, sin IA).

## Fase 5 — Backup `.reminly`

- Export (completo y por journal) con `expo-sharing`.
- Import como copia nueva con `expo-document-picker`.

## Fase 6 — Pulido + publicación

- Onboarding, estados vacíos, microinteracciones.
- EAS Build + Submit → **Play Store (Android primero)**.
- EAS Update para parches OTA.

## Backlog / más adelante (fuera del MVP)

- Vídeo y audio en el lienzo (salto de dificultad notable).
- Dibujo a mano alzada (requiere Skia).
- IA como ayuda creativa (composición, auto-organizar, estética).
- iOS.
- Comunidad (compartir plantillas/estilos), sync entre dispositivos, premium.
