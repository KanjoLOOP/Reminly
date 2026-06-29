# Roadmap

> Última actualización: 2026-06-29.

## Hecho ✅

- Lienzo manipulable (mover/escalar/rotar) + **redimensionado libre** (ancho/alto).
- Elementos: **fotos, GIFs, vídeos en bucle, notas de voz, texto, stickers, washi**.
- Personalización: tipografías, **color de texto**, marcos de foto, papel (color + patrón +
  **color de líneas**), **portadas de libreta** (tipo + color).
- **Lock** al manipular (solo el seleccionado responde; sin cambios accidentales).
- Biblioteca tipo bottom-sheet con pestañas (Stickers, Papeles, Washi, Marcos, Tipografías).
- Persistencia local + **autoguardado** (debounce, al salir y en segundo plano).
- **Multi-journal** (estantería) con navegación.
- **Bandeja de recuerdos**: captura rápida (foto/nota/voz/vídeo) → convertir en página
  (libreta nueva o existente).
- **Backup `.reminly`** (export/import).
- Pulido: botón atrás de Android, hint en lienzo vacío, auto-descartar libretas vacías,
  fotos a su proporción real (no se recortan).
- **Privacidad/seguridad**: compresión + borrado de EXIF, validación de import, permisos
  mínimos, cero red.
- Limpieza de código muerto (plantilla y componentes superseded eliminados).

## Siguiente: preparar publicación (Play Store)

- Icono + splash con identidad propia (ahora son los de ejemplo).
- Nombre, versión y package id definitivos.
- Build de producción con **EAS** (`eas build`) y subida (`eas submit`).
- Política de privacidad (Google la exige aunque todo sea local) + ficha de la store.
- Cuenta de Google Play Developer.

## Backlog (post-lanzamiento)

- Dibujo a mano alzada (Skia).
- Vídeo: recorte a 5s / boomerang (development build + ffmpeg).
- Buscador de GIFs (Giphy/Tenor).
- iOS.
- Comunidad (compartir plantillas/estilos), sync entre dispositivos, premium.
