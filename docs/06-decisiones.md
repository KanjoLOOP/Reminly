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

---

### Plantilla para nuevas decisiones

```
## ADR-00X — Título
**Decisión:** ...
**Motivo:** ...
**Descartado / Implicación / Revisión futura:** ...
```
