# Catálogo de Componentes — Socratech Motion Design System (`COMPONENT_CATALOG.md`)

Biblioteca inicial de componentes reutilizables implementada sobre estándares nativos de **HyperFrames v0.9.91** (HTML, CSS, SVG y GSAP determinista) en:
- Estilos base: [video-generation/project/styles/brand-system.css](../project/styles/brand-system.css)
- Tokens sincronizados: [video-generation/project/styles/tokens.css](../project/styles/tokens.css)
- Helpers JS y geometría intacta: [video-generation/project/components/components-library.js](../project/components/components-library.js)

> **Estado general (Hito 0B):** Todos los componentes de la biblioteca inicial fueron implementados y verificados visual y técnicamente en `SocratechBrandShowcase`.

---

## 1. `EditorialTitle`

- **Propósito:** Titular editorial con eyebrow opcional, remate conceptual bicolor en `#CEEF62` (con contorno de contraste), barra divisoria animada y bajada.
- **Selectores CSS principales:** `.st-editorial-title`, `.st-eyebrow-row`, `.st-headline-lg`, `.st-headline-md`, `.st-display-lime-on-dark`, `.st-display-lime-on-light`, `.st-accent-pill-on-light`, `.st-lead-copy`.
- **Variantes y propiedades configurables:**
  - Tema oscuro (`.st-theme-dark`): línea base `#FBFBF4`, palabra destacada con `.st-display-lime-on-dark` (`#CEEF62` con `-webkit-text-stroke: 3.5px #56607B`, `paint-order: stroke fill`).
  - Tema claro (`.st-theme-light`): línea base `#121D42`, palabra destacada con `.st-accent-pill-on-light` (bloque sólido `#CEEF62` con texto `#101A39` y borde `#10204D`) o `.st-display-lime-on-light` (`#CEEF62` con contorno `#10204D` en display SVG/tamaño hero).
- **Dependencias:** `tokens.css`, GSAP `tl.fromTo` sobre `opacity`, `y`, `filter` (`blur`).
- **Ejemplo:** Ver [scene-01-editorial-dark.html](../project/compositions/scene-01-editorial-dark.html) y [scene-02-technical-light.html](../project/compositions/scene-02-technical-light.html).
- **Estado:** Implementado y validado en claro y oscuro (`55/55` controles WCAG AA aprobados).

---

## 2. `OrbitMotif`

- **Propósito:** Motivos orbitales concéntricos de marca (arcos de fondo en esquina, anillos orbitales punteados/sólidos alrededor del isotipo, puntos satélite y asterisco satélite).
- **Selectores CSS principales:** `.st-orbit-bg`, `.st-orbit-arc`, `.st-orbit-arc--outer` (`0.18` oscuro / `0.09` claro), `.st-orbit-arc--inner` (`0.12` oscuro / `0.08` claro), `.st-orbit-arc--bottom` (`0.13` oscuro / `0.10` claro), `.st-orbit-system`, `.st-orbit-ring-outer`, `.st-orbit-ring-inner`.
- **Propiedades configurables:** Polaridad mediante clase padre `.st-theme-dark` / `.st-theme-light`, radio de órbitas y velocidades contrarrotantes `2:3` (`20 °/s` exterior, `-13.33 °/s` interior sobre ventana finita de 5 s).
- **Dependencias:** SVG inline marcado con `data-layout-ignore="true"` para decoración sangrada sin interferir en auditoría de texto.
- **Estado:** Implementado y validado en las 3 escenas de `SocratechBrandShowcase`.

---

## 3. `TechDiagram`

- **Propósito:** Construcción de diagramas técnicos, flujos modulares y bloques de código explicativos mediante tarjetas con perímetro trazado (*Wilma Card*), conectores vectoriales animados y terminal de diagnóstico (*Consola Socrática*).
- **Selectores CSS principales:**
  - Contenedor y nodos: `.st-tech-diagram`, `.st-wilma-node`, `.st-wilma-outline-svg`, `.st-wilma-node-inner`, `.st-node-header`, `.st-node-tag`, `.st-node-pill`, `.st-node-title`, `.st-node-desc`.
  - Conectores animados: `.st-connector-row`, `.st-connector-label`, `.s2-pulse-dot` (SVG `<line pathLength="34" stroke-dasharray="34">` animado vía `strokeDashoffset`).
  - Terminal: `.st-console-panel`, `.st-console-header`, `.st-console-dots`, `.st-console-dot--accent`, `.st-console-filename`, `.st-console-body`, `.st-code-comment`, `.st-code-key`, `.st-code-accent`, `.st-code-cursor`.
- **Propiedades configurables:** Cantidad de nodos, etiquetas de etapa (`NODO 01..NN`), píldoras de estado (`#CEEF62` + `#101A39`), líneas de consola y nombre de archivo.
- **Ejemplo:** Ver [scene-02-technical-light.html](../project/compositions/scene-02-technical-light.html).
- **Estado:** Implementado y validado (trazos `strokeDashoffset` + pulso determinista + consola escalonada).

---

## 4. `ThinkerMark`

- **Propósito:** Encapsular exclusivamente el isotipo original del pensador (`viewBox="0 0 580 590"`, `<path fill-rule="evenodd">` inmutable) para uso como emblema principal con anillo orbital o como marca de agua sangrada.
- **Activos compartidos generados:**
  - [thinker-mark-dark-bg.svg](../../shared/brand/assets/thinker-mark-dark-bg.svg) (`#FBFBF4` para fondo `#101A39`).
  - [thinker-mark-light-bg.svg](../../shared/brand/assets/thinker-mark-light-bg.svg) (`#101A39` para fondo `#FBFBF4`).
  - [thinker-mark-lime-watermark.svg](../../shared/brand/assets/thinker-mark-lime-watermark.svg) (`#CEEF62` para marca de agua sobre oscuro).
- **Selectores CSS y JS:** `.st-thinker-mark`, `.st-thinker-badge`, `.st-thinker-ring`, `.st-watermark-layer` (`opacity: 0.075`), `SocratechBrand.THINKER_PATH_D`, `SocratechBrand.hydrateThinkerMarks()`.
- **Regla de preservación:** Ninguna variante altera la silueta ni el `aspect-ratio: 580 / 590`; únicamente cambia `fill` según la polaridad de superficie.
- **Estado:** Implementado y validado (badge orbital en Escenas 1 y 3; marca de agua al `0.075` en Escenas 1, 2 y 3).

---

## 5. `EditorialDivider`

- **Propósito:** Estructurar ritmo visual mediante las barras divisorias redondeadas de tarjeta (`rx: 3px`, color `#CEEF62`), líneas divisorias hairline (`1px–1.5px`), el asterisco socrático (`strokeWidth: 3`) y el bloque geométrico de esquina inferior derecha.
- **Selectores CSS principales:** `.st-editorial-divider`, `.st-divider-pill`, `.st-divider-hairline`, `.st-asterisk-icon`, `.st-corner-block`.
- **Propiedades configurables:** Ancho relativo de barra (`112 px` editorial o `230 px–252 px` en lockup de marca), escala horizontal animada (`scaleX: 0 -> 1` desde origen izquierdo).
- **Estado:** Implementado y validado en todas las escenas.

---

## 6. `BrandOutro` (Lockup Provisional)

- **Propósito:** Ensamblar la composición institucional de apertura o cierre con tres elementos independientes y configurables por separado, más el bloque de contacto de tarjeta y la marca explícita de estado provisional.
- **Elementos independientes configurables (declarados como variables en [index.html](../project/index.html)):**
  1. **Isotipo:** `ThinkerMark` intacto dentro de anillo orbital `#CEEF62` (`#s3-badge`).
  2. **Wordmark (`brandName`):** Texto independiente `SOCRATECH` dividido en glifos `.s3-wordmark-char` mediante `SocratechBrand.splitWordmarkChars()`.
  3. **Eslogan (`sloganLine1`, `sloganLine2`):** Línea 1 `ENTENDER PRIMERO.` en `#FBFBF4` y Línea 2 `RESOLVER MEJOR.` en `#CEEF62` con contorno `#56607B`, separados por la barra `.s3-divider-bar`.
  4. **Etiqueta explícita (`provisionalNote`):** Píldora `LOCKUP PROVISIONAL · HITO 0B` y atributo `data-lockup-status="provisional"`.
- **Selectores CSS principales:** `.st-brand-outro`, `.st-lockup-wordmark-row`, `.st-slogan-stack`, `.st-slogan-line--primary`, `.st-slogan-line--accent`, `.st-contact-card`, `.st-contact-row`, `.st-provisional-note`.
- **Ejemplo:** Ver [scene-03-brand-outro.html](../project/compositions/scene-03-brand-outro.html).
- **Estado:** Implementado y validado (Receta 1 Intro/Outro completa + >= 3.2 s de lectura estable al cierre).
