<div align="center">

# 📖 Reminly

**Journaling digital y scrapbooking para guardar recuerdos de forma creativa.**

Cálida, táctil y *local-first*. Como abrir una libreta llena de recuerdos.

`Expo` · `React Native` · `TypeScript` · `Android primero`

</div>

---

## ✨ Qué es

Reminly convierte el proceso lento de hacer un scrapbook bonito (imprimir fotos, pegar,
decorar, escribir) en algo **rápido y agradable**, sin perder la sensación de estar
creando algo personal.

Un **lienzo libre** donde colocas y organizas fotos, texto, stickers, washi tapes y
papeles. Todo se mueve, redimensiona y rota con los dedos. La estética se inspira en una
libreta física —texturas de papel, sombras cálidas, pegatinas— y huye a propósito del look
de una app de productividad.

## 🎯 Principios

- **El control es del usuario.** La app ayuda, no decide.
- **Táctil y físico.** Manipular objetos sobre papel, no rellenar formularios.
- **Simplicidad antes que potencia.**
- **Local y privado.** Los recuerdos viven en el dispositivo.

## 🧱 Stack

| Capa | Tecnología |
|---|---|
| Framework | Expo (managed) + TypeScript |
| Navegación | expo-router |
| Estado | Zustand |
| Canvas | react-native-gesture-handler + react-native-reanimated |
| Media | expo-image · expo-image-picker · expo-image-manipulator |
| Persistencia | expo-file-system (JSON por journal) |
| Backup | expo-sharing · expo-document-picker (archivo `.reminly`) |

> Sin cloud, sin cuentas, sin IA en el MVP. Todo local. Detalles y motivos en
> [`docs/01-stack.md`](docs/01-stack.md) y [`docs/06-decisiones.md`](docs/06-decisiones.md).

## 📂 Estructura

```
Reminly/
├─ app/                 # Pantallas (expo-router)
├─ src/
│  ├─ features/         # canvas · library · tray · journal · backup
│  ├─ core/             # ui + theme (design tokens)
│  ├─ data/             # models · storage · repositories
│  └─ lib/              # utilidades
├─ assets/              # papers · stickers · washi · fonts · icons
└─ docs/                # documentación viva del proyecto
```

Detalle completo en [`docs/02-arquitectura.md`](docs/02-arquitectura.md).

## 💾 Backup local

Cada journal se guarda como una carpeta (`journal.json` + `/media`). El **formato de
guardado es el de backup**: exportar es comprimir esa carpeta en un archivo `.reminly`
(zip) que se comparte y se importa en otro dispositivo. Esquema en
[`docs/03-modelo-datos.md`](docs/03-modelo-datos.md).

## 🗺️ Roadmap

1. **Spike del canvas** — lienzo de papel con foto + texto manipulables. ⭐ mayor riesgo
2. **Engine + persistencia** — serializar y guardar journals
3. **Biblioteca de recursos** — stickers, papeles, washi, tipografías
4. **Bandeja de recuerdos** — captura rápida → página
5. **Backup `.reminly`** — export / import
6. **Pulido + publicación** en Play Store

Detalle en [`docs/04-roadmap.md`](docs/04-roadmap.md).

## 🎨 Diseño

Identidad cálida basada en papel: tipografías **Caveat** (manuscrita) + **Nunito** (UI),
paleta de cremas y kraft con acentos terrosos, y sombras tintadas en cálido. Tokens en
[`src/core/theme/tokens.ts`](src/core/theme/tokens.ts); guía en
[`docs/05-design-system.md`](docs/05-design-system.md).

## 🚧 Estado

En diseño y planificación. Estructura, documentación y design tokens listos. Pendiente el
scaffold de Expo y el spike del canvas.

## 📚 Documentación

Toda la documentación de desarrollo está en [`docs/`](docs/README.md) y se mantiene viva a
medida que avanza el proyecto.

---

<div align="center">
<sub>Proyecto personal · construido con criterio de producto, no solo "que funcione".</sub>
</div>
