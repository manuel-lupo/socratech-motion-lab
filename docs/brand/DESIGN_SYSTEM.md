# Socratech Motion Design System (`DESIGN_SYSTEM.md`)

Especificación técnica del sistema audiovisual implementado en [video-generation/project/](../project/) sobre **HyperFrames CLI v0.9.91**, derivado estrictamente de los documentos oficiales en [docs/brand/](../../docs/brand/).

---

## 1. Principios y fuente de verdad

- **Autoridad cromática:** Paleta oficial de tarjetas comerciales documentada en [docs/brand/BRAND_TOKENS.md](../../docs/brand/BRAND_TOKENS.md).
- **Tema alternativo legacy:** Los colores del sitio web original (`#071F64`, `#218487`, `#F4F5F0`, `#E4E9F5`) permanecen encapsulados bajo `[data-brand-theme="web-legacy"]` únicamente como referencia histórica y nunca como tema predeterminado.
- **Integridad del isotipo:** El `<path>` calado (`viewBox="0 0 580 590"`, `fill-rule="evenodd"`) de [assets/brand-source/logo.svg](../../assets/brand-source/logo.svg) es inmutable y se consume mediante las variantes de polaridad generadas automáticamente en [shared/brand/assets/](../../shared/brand/assets/).

---

## 2. Sistema cromático y reglas de contraste

### 2.1 Tokens principales (Tema predeterminado)

| Rol | Token CSS | Valor Hex | Uso audiovisual y contraste |
| :--- | :--- | :--- | :--- |
| Fondo oscuro principal | `--st-ink` | `#101A39` | Lienzo de escenas editoriales e institucionales (`Scene 1`, `Scene 3`) y fondo de `Consola Socrática`. |
| Fondo claro principal | `--st-bg-light` | `#FBFBF4` | Lienzo marfil de escenas técnicas y explicativas (`Scene 2`). |
| Superficie de tarjetas claras | `--st-surface-card` | `#FFFFFF` | Relleno de nodos *Wilma Card* sobre `#FBFBF4`. |
| Tinta primaria sobre claro | `--st-ink-text` | `#121D42` | Titulares y encabezados sobre `#FBFBF4` / `#FFFFFF` (`> 14:1` WCAG AAA). |
| Tinta de trazos sobre claro | `--st-ink-stroke` | `#10204D` | Perímetros SVG (`rx=24`), conectores técnicos, asterisco, iconos y contorno display sobre claro. |
| Tinta primaria sobre oscuro | `--st-ink-fg` / `--st-ink-fg-pure` | `#FBFBF4` / `#FFFFFF` | Titulares `#FBFBF4` sobre `#101A39` y valores de contacto / código `#FFFFFF` (`> 15:1` WCAG AAA). |
| Tinta secundaria sobre oscuro | `--st-ink-muted` | `#949EB9` | Bajadas, eyebrows, comentarios de consola y contorno alternativo (`idea.`). Contraste `~6.8:1` sobre `#101A39`. |
| Tinta secundaria sobre claro | `--st-muted-light` | `#56607B` | Descripciones de nodos, eyebrows y contorno de `RESOLVER MEJOR.` sobre `#101A39`. Contraste `~6.0:1` sobre `#FBFBF4`/`#FFFFFF`. |
| Acento eléctrico oficial | `--st-accent` | `#CEEF62` | Anillo orbital sobre oscuro, satélites, barras divisorias `rx=3`, cursor, píldoras de acento y bloque de esquina. |

### 2.2 Reglas obligatorias para `#CEEF62` y opacidades

1. **Display `#CEEF62` sobre fondo oscuro (`#101A39`):** Contraste directo alto (`> 13:1`), acompañado de contorno exterior (`paint-order: stroke fill`) en `--st-accent-stroke-on-dark` (`#56607B`) o `--st-accent-stroke-on-dark-alt` (`#949EB9`).
2. **Display `#CEEF62` sobre fondo claro (`#FBFBF4`):** Prohibido usar `#CEEF62` sin soporte para texto corrido o líneas delgadas. Se utiliza:
   - En bloques sólidos/píldoras con texto `--st-accent-fg` (`#101A39`) y borde `--st-ink-stroke` (`#10204D`), garantizando `~13.4:1` WCAG AAA en auditoría automática y visual.
   - En tipografía display de gran cuerpo con clase `.st-display-lime-on-light` (contorno exterior `#10204D`).
3. **Opacidades orbitales:**
   - Oscuro (`#101A39`): `#CEEF62` al `0.18` (exterior), `0.12` (interior) y `0.13` (inferior).
   - Claro (`#FBFBF4`): `#101A39` al `0.09` (exterior), `0.08` (interior) y `0.10` (inferior).
4. **Marca de agua del isotipo:** `opacity: 0.075` exacta (`#CEEF62` sobre oscuro, `#101A39` sobre claro).

---

## 3. Tipografía y jerarquías (Vertical `1080 × 1920`)

- **Familias cargadas localmente vía `@font-face` (`woff2`):**
  - Sans-serif: `--st-font-sans` (`"Manrope", "Inter", system-ui, -apple-system, sans-serif`). *(Nota: los archivos binarios actuales en `assets/fonts/` corresponden a `Inter-400.woff2` / `Inter-700.woff2` registrados localmente mientras se incorporan los `.woff2` estáticos oficiales de `Manrope`).*
  - Monospace: `--st-font-mono` (`"JetBrains Mono", ui-monospace, monospace`).
- **Piso de legibilidad móvil:** Todo texto legible en composiciones `1080 × 1920` se renderiza a `>= 29 px` (por encima del piso mínimo de HyperFrames `2.6 % × 1080 = 28.08 px`).

| Nivel | Tamaño (1080×1920) | Peso | Interlineado | Tracking | Uso |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Wordmark `SOCRATECH` | `84 px` | `700` | `1.00` | `+0.055em` | Lockup provisional de marca (mayúsculas) |
| Titular Display H1 | `72 px` – `84 px` | `700` | `1.05`–`1.06` | `-0.04em` | Escenas editoriales oscuras |
| Titular Técnico H2 | `62 px` – `68 px` | `700` | `1.08` | `-0.035em` | Cabecera de diagramas y explicadores |
| Eslogan de marca | `42 px` – `46 px` | `700` | `1.18` | `+0.05em` | `ENTENDER PRIMERO.` / `RESOLVER MEJOR.` |
| Título de nodo / CTA | `36 px` – `44 px` | `700` | `1.15`–`1.20` | `-0.02em` | Tarjetas *Wilma* y cierre *"Contanos tu idea."* |
| Cuerpo / Bajada | `29 px` – `32 px` | `400` | `1.35`–`1.45` | `-0.01em` / `0` | Subtítulos, descripciones de nodos, contacto |
| Eyebrow / Consola | `29 px` | `700` / `400` | `1.20`–`1.35` | `+0.16em` / `0` | Categorías con `*` y código en terminal |

---

## 4. Zonas seguras y reglas de composición

Para piezas verticales `9:16` (`1080 × 1920`), todo contenido textual y diagramático esencial permanece dentro de la **zona segura universal compatible con TikTok, Instagram Reels y YouTube Shorts**:

- **Margen horizontal seguro:** `x ∈ [124 px, 774 px]` (`width: 646 px–648 px` en el tercio inferior para librar la barra vertical de acciones en `x > 780 px`).
- **Margen vertical seguro:** `y ∈ [292 px, 1244 px]` (dejando libres los primeros `288 px` superiores y los últimos `672 px` inferiores para interfaces nativas de redes sociales).
- **Decoración perimetral:** Las órbitas de fondo (`.st-orbit-bg`), marcas de agua (`.st-watermark-layer`) y bloques geométricos de esquina (`.st-corner-block`) ocupan los márgenes sangrados marcados con `data-layout-ignore="true"`.

---

## 5. Temas disponibles

1. **`cards-official` (por defecto en `:root`):** Paleta comercial `#101A39` / `#FBFBF4` / `#CEEF62`.
2. **`web-legacy` (`[data-brand-theme="web-legacy"]`):** Mapeo histórico `#071F64` / `#F4F5F0` / `#218487` conservado únicamente para referencia o piezas retrospectivas bajo autorización explícita.
