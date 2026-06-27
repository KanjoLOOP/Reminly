# Stack técnico

> Stack realista para un perfil junior (DAM), en solitario, con objetivo de publicar en
> Play Store. Moderno pero sin sobre-ingeniería. Última actualización: 2026-06-27.

## Resumen

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Expo (managed) + TypeScript** | Camino más corto a Play Store. EAS compila y sube sin tocar Gradle/Xcode. |
| Lenguaje | **TypeScript** (strict) | Tipado seguro; familiar viniendo de Java/C#. |
| Navegación | **expo-router** | Rutas basadas en archivos (estilo Next). Curva suave, deep links gratis. |
| Estado | **Zustand** | Mínimo boilerplate. El documento abierto es un store. |
| Canvas | **react-native-gesture-handler + react-native-reanimated** | Mover/escalar/rotar en el hilo de UI (60–120 fps) sobre Views normales. |
| Imágenes | **expo-image**, **expo-image-picker**, **expo-image-manipulator** | Selección + compresión de fotos. |
| Sistema de archivos | **expo-file-system** | Guardar journals y media en local. |
| Backup | **expo-sharing** + **expo-document-picker** + zip | Export/import `.reminly` sin backend. |

## Decisión clave: el canvas SIN Skia (de momento)

Montar un engine de canvas en **Skia** desde cero es trabajo de senior. Para el MVP, cada
elemento del lienzo es una **`View` posicionada en absoluto** con un gesto compuesto de
Reanimated (pan + pinch + rotate). Se consigue el ~80% del "wow" con una fracción de la
dificultad:

- Textura de papel → `ImageBackground`.
- Sombras → props nativas (`shadowColor`, `elevation`).
- Stickers / fotos → `<Image>`. Texto → `<Text>` editable.

**Skia se reserva** para una fase posterior y **solo** para el dibujo a mano alzada.

## Lo que NO usamos (y por qué)

- **Redux** → demasiado boilerplate para esto. Zustand cubre el caso.
- **SQLite (por ahora)** → conceptos de más (migraciones, SQL). Guardamos JSON por journal.
  Se migrará a `expo-sqlite` solo si el rendimiento lo exige (cientos de páginas).
- **AWS / Supabase / backend** → fuera. Todo local. Sin coste, sin superficie de seguridad.
- **IA** → fuera del MVP. Entrará como ayuda creativa opcional más adelante.
- **Bare React Native** → fricción sin beneficio frente a Expo managed.

## Dependencias previstas (instalación en el scaffold)

```
expo, expo-router, expo-image, expo-image-picker, expo-image-manipulator,
expo-file-system, expo-sharing, expo-document-picker,
react-native-gesture-handler, react-native-reanimated, zustand,
react-native-uuid (o crypto.randomUUID)
```

Zip: evaluar `react-native-zip-archive` vs solución basada en `expo-file-system`.
Ver [03-modelo-datos](03-modelo-datos.md) para el formato de backup.
