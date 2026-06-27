# Design system y dirección visual

> Guía viva de identidad visual. Se irá rellenando con tokens reales cuando salgan del
> diseño. Última actualización: 2026-06-27.

## Sensación objetivo

Abrir Reminly = abrir una **libreta de recuerdos**. Cálido, táctil, analógico, relajante.
**Anti-productividad:** nada de UI fría, plana o corporativa.

## ✅ Confirmado (mockup en `design/mockups/Reminly.html`)

El diseño valida la dirección propuesta. Tokens reales ya extraídos a
[`src/core/theme/tokens.ts`](../src/core/theme/tokens.ts):

- **Tipografías:** `Caveat` (manuscrita, títulos/contenido) + `Nunito` (UI).
- **Sombras cálidas:** todas tintadas con `rgba(59,58,54,…)` (tinta), nunca negras.
  Escala: sm `.08` / md `.18` / lg `.22` / sheet `-12px .30`.
- **Radios:** UI 14–18px, bottom sheet 28px arriba, botones tipo pill.
- **Pantallas presentes:** Editor (con foto seleccionada + gizmos + toolbar flotante),
  Home (estantería de libretas), Biblioteca (bottom sheet con pestañas), Bandeja
  (tarjetas de captura).

### Paleta confirmada

| Rol | Hex |
|---|---|
| Papel | `#FBF7F0` / `#FCFAF5` / `#F4EDE1` |
| Kraft | `#C9A77C` (+ `#E3D4BA`, `#D9C7A8`, `#CBBFA6`) |
| Tinta | `#3B3A36` (texto + base de sombras), `#211F1B` |
| Texto secundario | `#9A8F7D` / `#B6A98F` |
| Acento rosa | `#E8A598` (+ `#D98A73`, `#FBEAE5`) |
| Acento salvia | `#A7B9A0` |
| Acento mostaza | `#E9C46A` |

---

## Dirección visual (hipótesis inicial — ya validada)

- **Texturas de papel** reales (kraft, crema, cuadrícula tenue) como fondo de lienzo.
- **Sombras suaves y cálidas**, no negras duras: los elementos parecen pegados sobre papel.
- **Bordes orgánicos**: ligeras rotaciones, esquinas redondeadas, sensación "hecho a mano".
- **Stickers y washi** como decoración protagonista.

## Paleta (borrador)

| Rol | Color sugerido | Notas |
|---|---|---|
| Fondo papel | `#F4EDE1` / `#FBF7F0` | cremas cálidos |
| Kraft | `#C9A77C` | papel reciclado |
| Tinta principal | `#3B3A36` | texto, casi negro cálido |
| Acento 1 | `#E8A598` | rosa terroso |
| Acento 2 | `#A7B9A0` | verde salvia |
| Acento 3 | `#E9C46A` | mostaza suave |

> Pendiente: confirmar con los mockups y fijar tokens en `src/core/theme`.

## Tipografía

- **Sans redondeada** para la UI (pendiente de cargar: Nunito).
- Nunca una sans corporativa neutra para el contenido del journal.

### Catálogo de fuentes del usuario (manuscritas/decorativas)

Cargadas con `expo-font` vía `@expo-google-fonts/*`. Definidas en
[`src/core/theme/fonts.ts`](../src/core/theme/fonts.ts). El usuario elige por elemento de
texto; la predeterminada es **Caveat**.

Caveat (default), Dancing Script, Satisfy, Patrick Hand, Shadows Into Light, Indie Flower,
Kalam, Amatic SC.

Para añadir una más: instalar su paquete, importarla en `fonts.ts` y añadirla a
`fontAssets` + `FONT_OPTIONS`.

## Pantallas a diseñar (orden sugerido)

1. **Home / estantería** de journals (portadas como libretas en una balda).
2. **Editor / lienzo** con foto + texto + sticker + washi colocados, toolbar flotante y
   gizmos de selección.
3. **Biblioteca de recursos** (bottom sheet por categorías).
4. **Bandeja de recuerdos** (quick capture).

---

## PROMPT PARA CLAUDE DESIGN

> Copia y pega esto para generar los primeros mockups. Itera pantalla a pantalla.

```
Diseña la interfaz de "Reminly", una app móvil (Android/iOS) de journaling digital y
scrapbooking para guardar recuerdos de forma creativa. NO es una app de productividad ni
un editor de notas: la sensación debe ser la de abrir una libreta física llena de
recuerdos — cálida, táctil, analógica y relajante.

Estética:
- Texturas de papel reales (kraft, crema, cuadrícula tenue) como base.
- Sombras suaves y cálidas; los elementos parecen pegatinas y fotos pegadas sobre papel,
  con ligeras rotaciones y bordes "hechos a mano".
- Paleta cálida: cremas (#FBF7F0, #F4EDE1), kraft (#C9A77C), tinta cálida (#3B3A36) y
  acentos terrosos (rosa #E8A598, salvia #A7B9A0, mostaza #E9C46A).
- Tipografía manuscrita para títulos y entradas (estilo Caveat / Patrick Hand) + una sans
  redondeada y amable para la UI (estilo Nunito).
- Decoración protagonista: stickers, washi tapes, marcos de foto, clips.
- Evita: gradientes fríos, sombras negras duras, esquinas perfectas, look corporativo,
  iconos genéricos de "app de tareas".

Diseña estas pantallas como mockups móviles realistas, con contenido de ejemplo creíble
(fotos de un viaje de verano, texto manuscrito):

1. HOME: una estantería/balda con varios journals como libretas físicas (portadas con
   textura, lomos, una con goma elástica). Botón cálido para crear uno nuevo.

2. EDITOR (la pantalla estrella): un lienzo con fondo de papel kraft donde hay colocados
   una foto con marco y sombra ligeramente rotada, un texto manuscrito, un sticker y una
   cinta washi. Un elemento aparece SELECCIONADO con gizmos en las esquinas (rotar/
   escalar). Una toolbar flotante e inferior, redondeada, con acciones: añadir foto,
   texto, sticker, washi, papel. Que se sienta un tablero táctil, no un formulario.

3. BIBLIOTECA DE RECURSOS: un bottom sheet que sube desde abajo con pestañas por
   categoría (Stickers, Papeles, Washi, Marcos, Tipografías) y una rejilla de miniaturas
   para arrastrar al lienzo.

4. BANDEJA DE RECUERDOS: una pantalla tipo "inbox" cálido donde se acumulan capturas
   rápidas del día (fotos, notas, una canción) en tarjetas, con un botón "Convertir en
   página".

Entrega cada pantalla en un frame de móvil, con detalle visual alto y coherencia entre
todas. Prioriza que transmitan calidez y tacto físico por encima de la densidad de
información.
```
