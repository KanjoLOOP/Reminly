# Reminly

App de journaling / scrapbook para guardar recuerdos. La idea es que montar una página
bonita —con tus fotos, notas, stickers, washi tape, audios— sea rápido y se sienta como
abrir una libreta de verdad, no como rellenar una app de notas.

Es un proyecto personal con el que estoy aprendiendo React Native a fondo. Todo es
**local en el dispositivo**: sin cuentas, sin nube, sin tracking. Las libretas se pueden
exportar a un archivo para pasarlas a otro móvil.

> Estado: en desarrollo. El editor y las libretas funcionan; faltan cosas (bandeja de
> captura rápida, pulido y publicación). Voy iterando.

## Qué hace ahora

- Estantería de libretas, cada una con su portada (tipo y color).
- Lienzo libre donde colocar y manipular con gestos: fotos, GIFs, vídeos en bucle, notas
  de voz, texto, stickers y washi tape.
- Personalización: tipografías, color de texto, marcos de foto, papel del lienzo (color +
  cuadrícula/líneas).
- Guardado automático en local + export/import de libretas (`.reminly`).

## Stack

Expo (React Native) + TypeScript. Navegación con expo-router, estado con Zustand, gestos
con react-native-gesture-handler y reanimated. Multimedia con expo-image / expo-audio /
expo-video. Persistencia con la API de archivos de Expo; el backup zipea con fflate.

No uso backend a propósito: el objetivo es que funcione sin conexión y sin depender de
nada externo.

## Arrancar en local

Necesitas Node 20 LTS (con versiones más nuevas el SDK actual de Expo da problemas) y la
app Expo Go en el móvil.

```bash
npm install
npx expo start
```

Escanea el QR con Expo Go. Si móvil y PC no están en la misma red, usa `npx expo start --tunnel`.

## Estructura

```
src/
  app/            rutas (expo-router): estantería y editor
  features/
    canvas/       el lienzo y los elementos manipulables
    library/      stickers, papeles, washi, marcos, tipografías
    journal/      portadas y estantería
  core/theme/     colores, tipografías, paleta
  data/           modelo y persistencia local
docs/             notas de diseño y decisiones del proyecto
```

## Notas

Hay documentación de diseño y decisiones técnicas en [`docs/`](docs/), que uso sobre todo
para no perder el hilo entre sesiones.
