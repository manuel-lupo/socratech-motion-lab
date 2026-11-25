# Inventario de Recursos y Activos — Socratech (`BRAND_ASSETS.md`)

**Proyecto:** Socratech Motion Lab (Hito 0A — Auditoría de Identidad Visual)  
**Alcance:** Recursos vectoriales, gráficos, tipográficos, capturas de referencia y componentes de código disponibles en `/home/mkayy/Documents/Projects/socratech` y `/home/mkayy/Downloads`.

---

## 1. Activos Oficiales de Marca

| Activo | Ruta exacta | Formato / Dimensiones | Estado | Notas de uso |
| :--- | :--- | :--- | :--- | :--- |
| **Isotipo del Pensador (Fuente de Verdad)** | `/home/mkayy/Documents/Projects/socratech/public/logo.svg` | SVG (`viewBox="0 0 580 590"`), 1 `<path>` `fill="#071F64"` `fill-rule="evenodd"` | **[CONFIRMADO]** | **Fuente de verdad única.** No alterar trazados. Usar `fill="#071F64"` sobre claro y `fill="#F4F5F0"` / `#FFFFFF` sobre oscuro. |
| **Tarjetas Comerciales (PDF 4 pág.)** | `/home/mkayy/Downloads/Socratech — Tarjetas de presentación _ Oscura + Clara.pdf` | PDF 1.7 (Figma), `850 × 470 pts`, 4 páginas | **[CONFIRMADO]** | Referencia completa impresa (Frente y Dorso en versión Oscura y Clara, incluye composición completa con QR). |
| **Tarjetas Comerciales (SVGs Figma)** | `/home/mkayy/Downloads/Socratech — Tarjetas de presentación _ Oscura + Clara.zip` | ZIP (`246,484` bytes descomprimidos) con 4 SVGs `850×470` | **[CONFIRMADO]** | Contiene: `01 · Oscura / Frente.svg`, `02 · Oscura / Dorso.svg`, `03 · Clara / Frente.svg`, `04 · Clara / Dorso.svg`. Todo texto está vectorizado en `<path>`. |
| **QR Oficial (PNG transparente)** | `/home/mkayy/Downloads/qr_socratech_sin_logo_transparente.png` | PNG (`13,728` bytes), transparencia alfa | **[CONFIRMADO]** | Código QR con módulos redondeados en `#101A39` y 5 módulos diagonales en `#CEEF62`. No incluye isotipo central. |
| **QR Oficial (JPEG vista previa)** | `/home/mkayy/Downloads/WhatsApp Image 2026-11-22 at 11.10.24 PM.jpeg` | JPEG (`251,896` bytes) | **[CONFIRMADO]** | Versión rasterizada con fondo claro de previsualización del mismo QR. |

### Detalle del contenido del ZIP de Tarjetas (`Socratech — Tarjetas de presentación _ Oscura + Clara.zip`) **[CONFIRMADO]**
- `01 · Oscura / Frente.svg` (`34,552 bytes`): Fondo `#101A39`, 3 arcos orbitales `#CEEF62`, satélite `#CEEF62` (`r=7`), anillo `#CEEF62` (`r=119.35`), isotipo `#FBFBF4`, `SOCRATECH` `#FBFBF4`, barra `#CEEF62` (`210×7`), `ENTENDER PRIMERO.` `#FBFBF4`, `RESOLVER MEJOR.` `#CEEF62` con contorno `#56607B`.
- `02 · Oscura / Dorso.svg` (`88,657 bytes`): Fondo `#101A39`, arcos orbitales, marca de agua del isotipo en `#CEEF62` (`opacity="0.075"`), `"Contanos tu"` `#FBFBF4` + `"idea."` `#CEEF62` (contorno `#949EB9`), barra `#CEEF62` (`83×8`), iconos (`Mail`, `Instagram`, `Globe+Cursor`) en `#CEEF62`, datos `hola@socratech.com.ar` (`#FFFFFF`), `@somos.socratech` (`#949EB9`), `www.socratech.com.ar` (`#FFFFFF`), bloque esquina `#CEEF62` (`90×54`). *(Nota: el QR no está incrustado dentro de este `.svg`; sí aparece compuesto en la página 2 del PDF).*
- `03 · Clara / Frente.svg` (`34,620 bytes`): Fondo `#FBFBF4`, 3 arcos orbitales `#101A39`, satélite `#CEEF62`, anillo `#101A39`, isotipo `#101A39`, `SOCRATECH` `#121D42`, barra `#CEEF62`, `ENTENDER PRIMERO.` `#121D42`, `RESOLVER MEJOR.` `#CEEF62` (contorno `#10204D`), bloque esquina `#CEEF62` (`90×54`).
- `04 · Clara / Dorso.svg` (`88,655 bytes`): Fondo `#FBFBF4`, arcos orbitales `#101A39`, marca de agua del isotipo `#101A39` (`opacity="0.075"`), `"Contanos tu"` `#121D42` + `"idea."` `#CEEF62` (contorno `#10204D`), barra `#CEEF62`, iconos `#10204D`, datos `#121D42` / `#56607B`, bloque esquina `#CEEF62` (`90×54`). *(El QR aparece compuesto en la página 4 del PDF).*

---

## 2. Capturas de Referencia Mobile **[CONFIRMADO]**

| Captura | Ruta exacta | Sección capturada | Hallazgos visuales verificados |
| :--- | :--- | :--- | :--- |
| **Hero Mobile** | `/home/mkayy/Downloads/WhatsApp Image 2026-11-24 at 1.03.56 PM.jpeg` | `#inicio` (`socratech.com.ar`) | Header sticky `#071F64` con isotipo invertido blanco + `SOCRATECH ®` + botón hamburguesa circular. Órbita arriba con `"Solo sé que no sé nada..."` en la parte superior, asterisco teal en órbita inferior derecha, puntos satélite gris y teal. Debajo: `* ESTUDIO DE SOFTWARE A MEDIDA`, titular en 2 líneas con `"mejor."` teal, copy, 2 botones en fila y cápsula `"Seguimos Soluciones"`. |
| **Principios Mobile** | `/home/mkayy/Downloads/WhatsApp Image 2026-11-24 at 1.03.56 PM (1).jpeg` | `#nosotros` (`socratech.com.ar`) | Fondo `#F4F5F0`, eyebrow `POR QUÉ SOCRATECH`, titular `"Lo que podés"` (índigo) + `"esperar de nosotros."` (teal), tarjetas apiladas con línea superior gruesa de `2px` índigo y asterisco teal encima de cada título. |

---

## 3. Imágenes del Proyecto Web (`/home/mkayy/Documents/Projects/socratech/public/`)

### 3.1 Casos de estudio / Portfolio (`public/work/`) **[CONFIRMADO]**

| Archivo | Ruta completa | Formato real (`file`) | Dimensiones | Uso en el sitio |
| :--- | :--- | :--- | :--- | :--- |
| `lavomil.png` | `/home/mkayy/Documents/Projects/socratech/public/work/lavomil.png` | JPEG (extensión `.png`) | `1425 × 990` | En uso en `components/site/work.tsx` (Lavomil — ERP + web de ventas). |
| `rincon-de-roma.png` | `/home/mkayy/Documents/Projects/socratech/public/work/rincon-de-roma.png` | JPEG (extensión `.png`) | `1265 × 712` | En uso en `components/site/work.tsx` (El Rincón de Roma — Catálogo + WhatsApp). |
| `automatizacion.png` | `/home/mkayy/Documents/Projects/socratech/public/work/automatizacion.png` | PNG RGB | `1024 × 1024` | Presente en disco, no referenciado en `work.tsx` (concepto ilustrativo previo). |
| `gestion.png` | `/home/mkayy/Documents/Projects/socratech/public/work/gestion.png` | PNG RGB | `1024 × 1024` | Presente en disco, no referenciado en `work.tsx`. |
| `turnos.png` | `/home/mkayy/Documents/Projects/socratech/public/work/turnos.png` | PNG RGB | `1024 × 1024` | Presente en disco, no referenciado en `work.tsx`. |

*(Nota en `README.md` L30: "Las imágenes de proyectos son conceptos ilustrativos" — aunque los commits recientes `9d6d235` y `caf7b6d` añadieron capturas y enlaces de proyectos reales `lavomil.com.ar` y `elrinconderoma.com.ar`.)*

### 3.2 Activos residuales de plantilla — NO USAR COMO MARCA **[CONFIRMADO]**
Los siguientes archivos dentro de `/home/mkayy/Documents/Projects/socratech/public/` son restos del template inicial (icono estilo Vercel/v0 o placeholders genéricos) y **no forman parte de la identidad de Socratech**:
- `public/icon.svg` (monograma geométrico ajeno de template `clip0_7960_43945`, no referenciado en `layout.tsx`).
- `public/apple-icon.png` (`180×180`), `public/icon-dark-32x32.png` (`32×32`), `public/icon-light-32x32.png` (`32×32`).
- `public/placeholder.svg`, `public/placeholder.jpg`, `public/placeholder-logo.svg`, `public/placeholder-logo.png`, `public/placeholder-user.jpg`.

---

## 4. Componentes Visuales y de Motion Reutilizables en Código **[CONFIRMADO]**

Todos ubicados en `/home/mkayy/Documents/Projects/socratech/components/site/`:

1. **`logo.tsx`** (`LogoMark`, `Logo`): Implementa la inversión de color del isotipo (`brightness-0 invert`) y el lockup horizontal del header/footer.
2. **`section-heading.tsx`** (`SectionHeading`): Cabecera estándar de sección con `eyebrow`, `title` + `accent` en `--accent` y `description`. Soporta `tone="light" | "dark"`.
3. **`decrypted-text.tsx`** (`DecryptedText`): Componente de React Bits adaptado con `motion/react` y Canvas text measurement (`fit` por carácter). Soporta `animateOn="view" | "hover" | "inViewHover" | "click"`, `effect="scramble" | "flip" | "fade"`, `sequential`, `revealDirection`. En `Hero` se usa `animateOn="view" sequential speed={45|70|75}`.
4. **`warp-text.tsx` + `warp-text.css`** (`WarpText`): Shader WebGL 2 sobre `ogl` (adaptado de React Bits) con distorsión `bulge | pinch | swirl`, aberración cromática e intro. *No está montado en `app/page.tsx` actualmente*, pero tiene hardcodeados los colores `#0E6668` y `#F4F5F0` en L259 para `"Grandes soluciones."`.
5. **`logo-loop.tsx` + `logo-loop.css` + `technology-loop.tsx`** (`LogoLoop`, `TechnologyLoop`): Carrusel continuo por `requestAnimationFrame` con soporte de `line | wave | arc | orbit`, `fadeOut` y pausa en hover. Muestra `TypeScript`, `React`, `Next.js`, `Node.js`, `PostgreSQL`, `APIs REST`, `Cloud`, `IA aplicada`.
6. **`horizontal-experience.tsx`** (`HorizontalExperience`): Motor de transición tipo Pager (inspirado en Museum of Motion) con Web Animations API, escalado automático `fitDesktop` y barra `.journey-bar`.
7. **`services.tsx`** (`Services`): Grilla hairline + diálogo `<dialog>` con animación SVG de contorno (`wilma-outline`).
8. **`method.tsx`** (`Method`, `MobileMethod`): Consola interactiva de 4 etapas con syntax highlighting semántico y carrusel circular táctil.
9. **`faq.tsx`** (`Faq`, `FaqItem`): Acordeón con segmentación por oración y entrada lateral alternada (`-35px` / `+35px`).

---

## 5. Activos Faltantes / Pendientes para Socratech Motion Lab **[PENDIENTE]**

- **[PENDIENTE]** **Archivo SVG oficial del logotipo completo** (isotipo + wordmark `SOCRATECH` + eslogan `ENTENDER PRIMERO. RESOLVER MEJOR.`). Mientras no exista, usar el lockup provisional especificado en [BRAND_AUDIT.md](./BRAND_AUDIT.md) (`docs/brand/BRAND_AUDIT.md`, sección 4.4).
- **[PENDIENTE]** **Archivos locales de fuentes (`.woff2` / `.ttf`)**: En el proyecto web, `Manrope` se importa dinámicamente vía `next/font/google`. Para renderizado determinista y offline en **HyperFrames**, será necesario descargar o enlazar localmente los archivos de `Manrope` (pesos `400`, `500`, `600`, `700`, `800`) y definir la fuente monospace oficial para escenas de código.
- **[PENDIENTE]** **Mockups / Renders en alta resolución de proyectos reales**: `lavomil.png` (`1425×990`) y `rincon-de-roma.png` (`1265×712`) sirven para previews medianas, pero si se realizan zooms agresivos en 1080p/4K pueden requerir capturas originales a `2x` o recreación vectorial/UI en HTML.
- **[PENDIENTE]** **Lineamientos sonoros / SFX**: No existen activos de audio en el proyecto original.
