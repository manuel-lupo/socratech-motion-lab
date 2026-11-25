# Tokens de Marca — Socratech (`BRAND_TOKENS.md`)

**Proyecto:** Socratech Motion Lab (Hito 0A — Auditoría de Identidad Visual)  
**Fuentes de extracción:**
- `/home/mkayy/Documents/Projects/socratech/app/globals.css`
- `/home/mkayy/Documents/Projects/socratech/app/layout.tsx`
- `/home/mkayy/Documents/Projects/socratech/components/site/*.tsx`
- `/home/mkayy/Documents/Projects/socratech/public/logo.svg`
- `/home/mkayy/Downloads/Socratech — Tarjetas de presentación _ Oscura + Clara.zip` (`01..04 *.svg`)

> Todos los valores marcados como **[CONFIRMADO]** fueron copiados textualmente del código fuente o de los atributos XML de los archivos SVG oficiales.

---

## 1. Paleta Oficial Prioritaria — Tarjetas Comerciales (Fuente de Verdad para Motion Lab) **[CONFIRMADO]**

Extraída directamente de `01 · Oscura / Frente.svg`, `02 · Oscura / Dorso.svg`, `03 · Clara / Frente.svg`, `04 · Clara / Dorso.svg` y `qr_socratech_sin_logo_transparente.png`. Por directriz de marca, esta paleta rige por defecto en **Socratech Motion Lab**.

### 1.1 Tokens de color de las tarjetas

| Token oficial | Hex | RGB | Rol y uso confirmado en tarjetas |
| :--- | :--- | :--- | :--- |
| `--card-navy-bg` | `#101A39` | `rgb(16, 26, 57)` | Fondo sólido de versión oscura; relleno del isotipo, anillo (`r=119.35`) y marca de agua (`opacity: 0.075`) en versión clara; módulos del código QR. |
| `--card-navy-text` | `#121D42` | `rgb(18, 29, 66)` | Color de texto principal (`SOCRATECH`, `ENTENDER PRIMERO.`, `Contanos tu`, email y web) en versión clara. |
| `--card-navy-stroke` | `#10204D` | `rgb(16, 32, 77)` | Contorno exterior de `RESOLVER MEJOR.` e `idea.`, e iconos de contacto (`stroke-width: 2.4` / `2`) en versión clara. |
| `--card-ivory-bg` | `#FBFBF4` | `rgb(251, 251, 244)` | Fondo sólido de versión clara; relleno del isotipo y titulares (`SOCRATECH`, `ENTENDER PRIMERO.`, `Contanos tu`) en versión oscura. |
| `--card-lime-accent` | `#CEEF62` | `rgb(206, 239, 98)` | **Acento principal eléctrico (Lima / Chartreuse).** Anillo isotipo (oscura), punto satélite (`r=7`), barras divisorias (`210×7`, `83×8`), relleno de `RESOLVER MEJOR.` e `idea.`, iconos (oscura), marca de agua oscura (`0.075`), bloque de esquina (`90×54`) y 5 módulos diagonales del QR. |
| `--card-slate-light` | `#949EB9` | `rgb(148, 158, 185)` | Texto secundario `@somos.socratech` y contorno exterior de `idea.` en versión oscura. |
| `--card-slate-dark` | `#56607B` | `rgb(86, 96, 123)` | Texto secundario `@somos.socratech` en versión clara y contorno exterior de `RESOLVER MEJOR.` en versión oscura. |
| `--card-white` | `#FFFFFF` | `rgb(255, 255, 255)` | Texto `hola@socratech.com.ar` y `www.socratech.com.ar` en versión oscura; caja contenedora del QR (`opacity: 0.54` en PDF [INFERIDO]). |

### 1.2 Opacidades y trazos de referencia en tarjetas **[CONFIRMADO]**
- **Órbitas de fondo sobre oscuro (`#101A39`):** `#CEEF62` con `stroke-width: 1.3`, opacidades `0.18` (superior derecha `r=239.35`), `0.12` (superior derecha `r=174.35`) y `0.13` (inferior izquierda `r=239.35`).
- **Órbitas de fondo sobre claro (`#FBFBF4`):** `#101A39` con `stroke-width: 1.3`, opacidades `0.09` (superior derecha `r=239.35`), `0.08` (superior derecha `r=174.35`) y `0.10` (inferior izquierda `r=239.35`).
- **Marca de agua del isotipo en dorso:** `opacity="0.075"` (`#CEEF62` sobre oscuro, `#101A39` sobre claro).

### 1.3 Mapeo de roles de diseño web a la paleta oficial de tarjetas **[INFERIDO]**
Para reutilizar los componentes y escenas del sitio web respetando la paleta de tarjetas:

| Rol semántico (Web) | Valor en Tarjetas (Usar en Motion Lab) | Notas de contraste |
| :--- | :--- | :--- |
| `--ink` / Fondo oscuro | `#101A39` | Sustituye a `#071F64`. |
| `--ink-foreground` | `#FBFBF4` (titulares/isotipo) / `#FFFFFF` (datos/código) | Sustituye a `#F4F5F0`. |
| `--ink-muted` | `#949EB9` | Sustituye a `#9FB0DD`. |
| `--ink-border` | `rgba(206, 239, 98, 0.18)` (órbitas) / `rgba(148, 158, 185, 0.28)` (UI) | Sustituye a `#24387A`. |
| `--background` / Fondo claro | `#FBFBF4` | Sustituye a `#F4F5F0`. |
| `--foreground` / `--primary` | `#121D42` (texto) / `#101A39` (isotipo/superficies) | Sustituye a `#071F64`. |
| `--muted-foreground` | `#56607B` | Sustituye a `#4B5A86`. |
| `--border` | `rgba(16, 26, 57, 0.14)` | Sustituye a `#CFD6E8`. |
| `--accent` | `#CEEF62` (texto sobre `#101A39` y barras/acentos) | **Regla de contraste:** sobre `#FBFBF4`, usar relleno `#CEEF62` con contorno `#10204D` (ej. `RESOLVER MEJOR.`) o `#10204D`/`#121D42` para texto fino. |
| `--accent-foreground` | `#101A39` | Texto oscuro de alto contraste sobre botones/píldoras `#CEEF62`. |

---

## 2. Paleta Legacy del Código Web (Referencia Histórica) **[CONFIRMADO]**

Definida originalmente en `/home/mkayy/Documents/Projects/socratech/app/globals.css` (L7–33 y L39–60). Se documenta aquí como referencia fiel del sitio web existente y para un eventual tema secundario (`web-legacy`).

### 2.1 Tokens semánticos CSS (`:root` original web)

| Token CSS | Hex | RGB | Rol y uso confirmado en código web |
| :--- | :--- | :--- | :--- |
| `--background` | `#F4F5F0` | `rgb(244, 245, 240)` | Papel cálido. Fondo base de página y secciones claras (`#soluciones`, `#nosotros`, `#preguntas`) y fondo del modal `.service-dialog`. |
| `--foreground` | `#071F64` | `rgb(7, 31, 100)` | Índigo socrático. Color principal de texto sobre fondos claros. |
| `--card` | `#FFFFFF` | `rgb(255, 255, 255)` | Blanco puro. Hover de tarjetas de servicio (`hover:bg-card`), fondo del panel `.technology-panel`, y fadeOutColor de `TechnologyLoop`. |
| `--card-foreground` | `#071F64` | `rgb(7, 31, 100)` | Texto dentro de tarjetas claras. |
| `--popover` | `#FFFFFF` | `rgb(255, 255, 255)` | Superficies flotantes/popovers. |
| `--popover-foreground` | `#071F64` | `rgb(7, 31, 100)` | Texto en popovers. |
| `--primary` | `#071F64` | `rgb(7, 31, 100)` | Color primario de marca: cajas de iconos, botones principales sobre claro (`#trabajos`), `border-t-2 border-primary` en `#nosotros`. |
| `--primary-foreground` | `#F4F5F0` | `rgb(244, 245, 240)` | Texto e iconos sobre `--primary`. |
| `--secondary` | `#E4E9F5` | `rgb(228, 233, 245)` | Mist (Niebla azulada). Fondo de la sección `#trabajos` y bloque `.service-dialog-example`. |
| `--secondary-foreground` | `#071F64` | `rgb(7, 31, 100)` | Texto sobre `--secondary`. |
| `--muted` | `#E4E9F5` | `rgb(228, 233, 245)` | Superficie apagada (placeholder de imágenes en `#trabajos`, hover de cerrar diálogo). |
| `--muted-foreground` | `#4B5A86` | `rgb(75, 90, 134)` | Slate medio. Párrafos descriptivos, eyebrows claros, tags y respuestas FAQ. |
| `--accent` | `#218487` | `rgb(33, 132, 135)` | Teal socrático. CTAs, palabras clave de titulares, asteriscos, cursor de consola, satélites, borde animado Wilma, indicador activo en `.journey-bar`. |
| `--accent-foreground` | `#FFFFFF` | `rgb(255, 255, 255)` | Texto e iconos sobre `--accent`. |
| `--destructive` | `#C0392B` | `rgb(192, 57, 43)` | Color de error / estado destructivo. |
| `--border` | `#CFD6E8` | `rgb(207, 214, 232)` | Borde frío sobre fondos claros (separadores `1px` de `#soluciones`, `#preguntas`, `#trabajos`, `.service-dialog`). |
| `--input` | `#CFD6E8` | `rgb(207, 214, 232)` | Borde de campos de entrada sobre fondos claros. |
| `--ring` | `#218487` | `rgb(33, 132, 135)` | Anillo de foco (`var(--accent)`). |
| `--ink` | `#071F64` | `rgb(7, 31, 100)` | Fondo de capítulos oscuros (`#inicio`, `#metodo`, `#contacto`), header, footer y viewport `themeColor`. |
| `--ink-foreground` | `#F4F5F0` | `rgb(244, 245, 240)` | Texto principal sobre `--ink`. |
| `--ink-muted` | `#9FB0DD` | `rgb(159, 176, 221)` | Texto secundario, navegación, subtítulos, eyebrows, promesas y líneas de consola sobre `--ink`. |
| `--ink-border` | `#24387A` | `rgb(36, 56, 122)` | Bordes, órbitas del Hero, divisores de header/footer/método, números de línea y botones secundarios sobre `--ink`. |

### 2.2 Colores literales adicionales hallados en CSS / TSX web **[CONFIRMADO]**

| Valor literal | Equivalente aprox. | Archivo y línea | Uso |
| :--- | :--- | :--- | :--- |
| `#E3E9F8` | Tint claro de `--ink-muted` | `app/globals.css` L184 | Texto de `.hero-quote` (`"Solo sé que no sé nada…"`). |
| `#34477E` | Tint claro de `--ink-border` | `app/globals.css` L128–129 | Puntos inactivos y borde de botones en `.journey-bar`. |
| `#617199` | Entre `#4B5A86` y `#9FB0DD` | `app/globals.css` L214 | Color de `.service-dialog-eyebrow`. |
| `#0E6668` | Teal oscuro | `components/site/warp-text.tsx` L259 | Color de la palabra `"soluciones."` en el componente `WarpText`. |
| `#071F64F5` | `rgba(7, 31, 100, 0.96)` | `app/globals.css` L126 | Fondo con blur de `.journey-bar`. |
| `#071F64FA` | `rgba(7, 31, 100, 0.98)` | `app/globals.css` L309 | Fondo del cajón `#mobile-nav`. |
| `rgb(7 31 100 / 18%)` | `#071F64` al 18% | `app/globals.css` L193 | Halo de legibilidad detrás de `.hero-quote` y `.hero-orbit-caption`. |
| `rgb(3 13 43 / 65%)` | `#030D2B` al 65% | `app/globals.css` L210, L245 | Backdrop oscuro del modal `.service-dialog`. |
| `rgb(33 132 135 / 12%)` | `#218487` al 12% | `app/globals.css` L550 | Hover del botón `.chapter-continue`. |
| `rgb(0 0 0 / 8%)` | Negro al 8% | `app/globals.css` L456 | Fondo de `.method-mobile-console`. |

---

## 3. Reglas Tipográficas y Jerarquía **[CONFIRMADO]**

### 3.1 Familias tipográficas
```css
/* app/layout.tsx + app/globals.css L36-37 */
--font-sans: var(--font-manrope), 'Manrope', system-ui, sans-serif;
--font-serif: var(--font-manrope), 'Manrope', system-ui, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
```
- **Nota sobre tarjetas Figma [INFERIDO]:** Los vectores de texto en los SVG de tarjetas presentan métricas y detalles geométricos compatibles con **Inter** (`Bold 700` / `SemiBold 600` / `Regular 400`). Para **Socratech Motion Lab**, estandarizar sobre **Manrope** (pesos `400`, `500`, `600`, `700`, `800`) y una fuente monospace legible (ej. `JetBrains Mono` o `ui-monospace` del sistema **[PENDIENTE]**) para escenas de consola.

### 3.2 Escala tipográfica del sitio web (`app/globals.css` + componentes)

| Nivel / Elemento | Selector / Archivo | Tamaño Desktop (`>=1024px`) | Tamaño Compacto (`h<=800px`) | Tamaño Mobile (`<640px`) | Peso | Line-height | Letter-spacing | Transform |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero H1** | `#inicio h1` / `.hero-decrypted-title` (`globals.css` L182, L388, L409, L568) | `clamp(48px, 5.2vw, 80px)` | `clamp(48px, 4.8vw, 70px)` | `clamp(27px, 8vw, 43px)` | `600` | `1.02`–`1.08` | `-0.055em` (`-0.05em` mobile) | Normal (oración) |
| **Contact H2** | `#contact-content h2` (`contact.tsx` L44, `globals.css` L269, L428) | `clamp(38px, 4vw, 62px)` | `clamp(36px, 3.5vw, 50px)` | `clamp(34px, 8.7vw, 48px)` | `600` | `0.98`–`1.08` | `-0.025em` (`-0.04em` mobile) | Normal (oración) |
| **Section H2** | `.horizontal-chapter h2` (`section-heading.tsx` L21, `globals.css` L143, L312, L637) | `clamp(32px, 3.3vw, 48px)` | `30px`–`34px` | `clamp(26px, 6.8vw, 44px)` | `600` | `1.02`–`1.13` | `tight` (`-0.04em` mobile) | Normal (oración) |
| **Method Verb** | `#metodo` (`method.tsx` L166, L453, L617) | `30px` (`md:text-3xl`) | `30px` | `24px`–`26px` | `600` | `1.2` | `-0.03em` | Normal |
| **Service Modal H2** | `.service-dialog h2` (`globals.css` L216, L222) | `30px` | `30px` | `26px` (`24px` `<360px`) | `700` | `1.15` | `-0.04em` | Normal |
| **Project Title H3** | `#trabajos ul>li h3` (`work.tsx` L54, `globals.css` L158, L339) | `21px` | `21px` | `23px` | `600` | `1.2` | Normal | Normal |
| **Card Title H3** | `#soluciones`, `#nosotros` (`services.tsx` L103, `principles.tsx` L38, `globals.css` L151, L636) | `17px`–`18px` | `16px` | `19px`–`20px` | `700` | `1.3` | Normal | Normal |
| **Hero Quote** | `.hero-quote` (`globals.css` L184–187, L406, L567) | `21px` | `19px` | `10px`–`12px` (compacto sobre órbita) | `500` | `1.5` | `-0.02em` | Normal |
| **Logo Wordmark** | `Logo` (`logo.tsx` L16) | `18px` (`text-lg`) | `18px` | `18px` | `800` | `1` | `0.12em` | Mayúsculas |
| **Lead / Copy Hero** | `#inicio .hero-detail-copy` (`hero.tsx` L32, `globals.css` L410, L569) | `18px` (`text-lg`) | `14px` | `clamp(12px, 1.75dvh, 15px)` | `400` | `1.55`–`1.65` | Normal | Normal |
| **Body / Descripción** | `#soluciones p`, `#trabajos p`, `#nosotros p`, `.faq-answer p` | `13px`–`16px` | `12px`–`13px` | `14px`–`15px` | `400` | `1.6`–`1.85` | Normal | Normal |
| **CTA Primario** | `hero.tsx` L40, `contact.tsx` L121, `globals.css` L572 | `16px` (`14px` header) | `16px` | `clamp(10px, 2.65vw, 13px)` | `700` | `1.2` | Normal | Normal |
| **Consola / Código** | `#metodo pre` (`globals.css` L154, L620, L637, L653) | `11px`–`12px` | `11px` | `9px`–`12px` | `400` / `600` | `1.65`–`1.9` | Normal | Literal |
| **Eyebrow** | `section-heading.tsx` L20, `hero.tsx` L18, `globals.css` L570 | `12px` (`text-xs`) | `12px` | `8px`–`9px` | `700` (`600` hero) | `1.4` | `0.15em`–`0.25em` | `uppercase` |
| **Micro-UI / Tags** | `.journey-label`, tags de servicio, footer legal | `9px`–`12px` | `9px`–`10px` | `8px`–`10px` | `600`–`700` | `1.2`–`1.6` | `0.08em`–`0.20em` | `uppercase` |

---

## 4. Radios, Bordes, Espaciados y Proporciones **[CONFIRMADO]**

### 4.1 Escala de radios (`app/globals.css` L27, L62–66 + Tailwind)
- Base `--radius`: `0.5rem` (`8px`).
  - `--radius-sm`: `0.3rem` (`4.8px`)
  - `--radius-md`: `0.4rem` (`6.4px`)
  - `--radius-lg`: `0.5rem` (`8px`)
  - `--radius-xl`: `0.7rem` (`11.2px`)
  - `--radius-2xl`: `0.9rem` (`14.4px`)
- Clases Tailwind y valores explícitos usados en componentes:
  - `rounded-xl` (`12px`): cajas de iconos en servicios (`size-12`), inputs de contacto.
  - `rounded-2xl` (`16px`): grilla de servicios, consola `#metodo`, tarjetas de proyecto `#trabajos`, panel de tecnologías `#nosotros`, formulario `#contacto`.
  - `24px`: modal `.service-dialog` y `.wilma-inner` (`23px` en `<rect>` interno de `.wilma-outline`).
  - `0 10px 10px 0`: bloque `.service-dialog-example`.
  - `rounded-full` (`9999px` / `50%`): botones CTA, tags, órbitas, puntos satélites, botones de control circular, `.chapter-continue button`.
  - `3px`: barras divisorias en tarjetas comerciales (`rx="3"`).

### 4.2 Grosores de borde
- `1px`: estándar estructural (`--border` / `--ink-border`) en tarjetas hairline, consola, inputs, cabecera/pie, acordeones FAQ y controles.
- `1.3px`: trazos orbitales y anillo de isotipo en tarjetas comerciales (`850×470`).
- `2px`: `.wilma-outline rect` (`stroke-width: 2`), `border-t-2 border-primary` en principios `#nosotros`, subrayado de enlaces (`decoration-2`), contorno de texto `RESOLVER MEJOR.` (`stroke-width="2"` enmascarado a `1px` exterior).
- `3px`: `border-left: 3px solid var(--accent)` en `.service-dialog-example`; `focus-visible` outline en `.service-card-trigger`; `strokeWidth={3}` en iconos `<Asterisk />`; contorno de texto `idea.` (`stroke-width="3"` enmascarado a `1.5px` exterior).

### 4.3 Contenedores y espaciados maestros
- **Ancho máximo de grilla:** `max-w-7xl` (`1280px`).
- **Padding horizontal de página:** `px-5` (`20px`) en mobile (`<768px`), `md:px-8` (`32px`) en tablet/desktop (`24px` en overrides mobile `globals.css` L402).
- **Alturas de cromo fijo:**
  - Header: `72px` (`h-18`) desktop / `68px` mobile.
  - Journey bar (desktop): `56px`.
  - Botón `.chapter-continue`: `52px` desktop / `48px`–`62px` mobile.
  - Área útil neta por escena en desktop: `100dvh - 128px` (`72px` header + `56px` journey-bar) o `- 180px` con `.chapter-continue`.

---

## 5. Bloque Exportable de CSS Tokens para Socratech Motion Lab

```css
:root {
  /* Tipografía */
  --st-font-sans: 'Manrope', system-ui, -apple-system, sans-serif;
  --st-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* Paleta Oficial Prioritaria — Tarjetas Comerciales */
  --st-ink: #101a39;
  --st-ink-text: #121d42;
  --st-ink-stroke: #10204d;
  --st-ink-fg: #fbfbf4;
  --st-ink-fg-pure: #ffffff;
  --st-ink-muted: #949eb9;
  --st-ink-border: rgba(148, 158, 185, 0.28);
  --st-orbit-dark-outer: rgba(206, 239, 98, 0.18);
  --st-orbit-dark-inner: rgba(206, 239, 98, 0.12);
  --st-orbit-dark-bottom: rgba(206, 239, 98, 0.13);

  --st-bg-light: #fbfbf4;
  --st-surface-card: #ffffff;
  --st-muted-light: #56607b;
  --st-border-light: rgba(16, 26, 57, 0.14);
  --st-orbit-light-outer: rgba(16, 26, 57, 0.09);
  --st-orbit-light-inner: rgba(16, 26, 57, 0.08);
  --st-orbit-light-bottom: rgba(16, 26, 57, 0.1);

  --st-accent: #ceef62;
  --st-accent-fg: #101a39;
  --st-accent-stroke-on-dark: #56607b;
  --st-accent-stroke-on-dark-alt: #949eb9;
  --st-accent-stroke-on-light: #10204d;
  --st-watermark-opacity: 0.075;
  --st-destructive: #c0392b;

  /* Radios y Strokes */
  --st-radius-pill: 9999px;
  --st-radius-modal: 24px;
  --st-radius-panel: 16px;
  --st-radius-control: 12px;
  --st-radius-divider: 3px;
  --st-stroke-hairline: 1px;
  --st-stroke-orbit: 1.3px;
  --st-stroke-accent: 2px;
}

[data-brand-theme="web-legacy"] {
  /* Paleta Legacy del Sitio Web (Referencia histórica) */
  --st-bg-light: #f4f5f0;
  --st-bg-light-alt: #e4e9f5;
  --st-ink: #071f64;
  --st-ink-text: #071f64;
  --st-ink-fg: #f4f5f0;
  --st-ink-border: #24387a;
  --st-ink-muted: #9fb0dd;
  --st-ink-quote: #e3e9f8;
  --st-border-light: #cfd6e8;
  --st-muted-light: #4b5a86;
  --st-accent: #218487;
  --st-accent-dark: #0e6668;
  --st-accent-fg: #ffffff;
}
```
