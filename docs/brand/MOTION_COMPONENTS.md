# Patrones y Contrato de Motion Design (`MOTION_COMPONENTS.md`)

Documentación técnica del comportamiento cinético implementado para **Socratech Motion Lab** en [video-generation/project/](../project/), alineado con [docs/brand/MOTION_RECOMMENDATIONS.md](../../docs/brand/MOTION_RECOMMENDATIONS.md) y el contrato de renderizado de **HyperFrames v0.9.91**.

---

## 1. Curvas maestras implementadas (`CustomEase`)

Definidas en [components-library.js](../project/components/components-library.js) mediante `window.SocratechBrand.registerSocratechEases()` cargando localmente `vendor/gsap/CustomEase.min.js`:

| Identificador GSAP | Curva `cubic-bezier` oficial | Referencia web original | Función en video |
| :--- | :--- | :--- | :--- |
| `stNobleReveal` | `(0.16, 1, 0.3, 1)` | `.hero-logo-entrance` | Entradas de isotipo, titulares, barra divisoria y glifos con desaceleración larga. |
| `stPagerCover` | `(0.76, 0, 0.24, 1)` | `HorizontalExperience.go()` | Cortina ascendente entre escenas Oscura ↔ Clara. |
| `stStructureSettle` | `(0.22, 0.61, 0.36, 1)` | *Wilma*, nodos y paneles | Trazado de perímetros SVG, aparición de tarjetas y consola. |
| `stDialogueSpring` | `(0.22, 0.8, 0.3, 1.12)` | `.faq-answer-line`, `#metodo` | Entradas laterales opuestas (`-35 px` vs `+35 px`) en diálogos y eslóganes. |

---

## 2. Contrato de renderizado determinista (`window.__hyperframes.seek(t)`)

Cada frame `f ∈ [0, 449]` en `30 fps` se evalúa de forma independiente sin depender del frame anterior:

1. **Timelines pausados independientes por sub-composición:**
   - Cada escena (`scene-01-editorial-dark`, `scene-02-technical-light`, `scene-03-brand-outro`) registra exactamente un `gsap.timeline({ paused: true })` en `window.__timelines[<id>]` **al final de su inicialización síncrona**.
   - El root `SocratechBrandShowcase` no llama `tl.add(...)` ni `tl.play()` sobre los timelines hijos; el runtime de HyperFrames ejecuta el seek de cada host acorde a su `data-start` y `data-duration`.
2. **Solo `gsap.fromTo` con baselines explícitos:**
   - Ningún elemento animado por GSAP define `opacity: 0` o `transform: ...` en CSS.
   - Si un elemento recibe una segunda animación dentro de la misma escena (como `#s1-safe` o `#s2-safe` durante la salida *Pager Cover*), lleva `immediateRender: false` para no sobreescribir el estado inicial en `t = 0`.
3. **Prohibición de ciclos infinitos y reloj libre:**
   - No se utilizan `requestAnimationFrame`, `setInterval`, `Date.now()`, `Math.random()` ni `repeat: -1`.
   - Todas las rotaciones orbitales se expresan como interpolaciones finitas y lineales (`duration: 5`, `ease: "none"`).
4. **Solo propiedades GPU/sub-pixel y trazos SVG:**
   - Movimiento exclusivo por `x`, `y`, `scale`, `scaleX`, `rotation`, `opacity`, `filter` (`blur` / `brightness`) y `strokeDashoffset`. Nunca se animan `top`, `left`, `width` o `height`.

---

## 3. Cobertura de recetas de `MOTION_RECOMMENDATIONS.md`

| Receta / Patrón | Estado en Hito 0B | Implementación verificada | Notas técnicas |
| :--- | :--- | :--- | :--- |
| **Intro / Outro (Receta 1)** | **Implementado y validado** | `scene-03-brand-outro.html` (`0.00 s – 1.75 s` + `>= 3.2 s` de hold). | Trazado de anillo `#CEEF62`, `stNobleReveal` de isotipo, glifos `SOCRATECH` escalonados, barra `scaleX`, eslogan en diálogo `-35 px` / `+35 px` y ficha de contacto. |
| **Pager Cover (Receta 2)** | **Implementado y validado** | Transiciones al `4.30 s – 5.00 s` (Oscura → Clara) y `9.30 s – 10.00 s` (Clara → Oscura). | Duración ágil `0.70 s` con curva `stPagerCover`, cortina cubriente desde abajo y atenuación de brillo (`brightness: 1 → 0.88`) de la escena saliente sin expulsar texto de la zona segura. |
| **Escalado Orbital 2:3 (Receta 3)** | **Implementado y validado** | `scene-01-editorial-dark.html` (`+100°` / `-66.67°` en `5 s`) y `scene-03` (`+100°`). | Relación exacta `20 °/s` exterior horario y `13.33 °/s` interior antihorario equivalente a `18 s / 27 s` por vuelta, manteniendo la composición viva durante los holds de lectura. |
| **Wilma Card (Receta 4)** | **Implementado y validado** | `scene-02-technical-light.html` (`NODO 01` y `NODO 02`). | Entrada opuesta (`-45 px` / `+45 px`) acompañada del trazado SVG `strokeDashoffset` sobre rectángulo `rx="24"` en `#10204D`. |
| **Consola Socrática (Receta 5)** | **Implementado y validado** | `scene-02-technical-light.html` (`#s2-console`, `1.78 s – 2.55 s`). | Marco `#101A39`, 3 puntos con acento `#CEEF62`, líneas monospace cada `0.15 s` y cursor con parpadeo finito (`repeat: 3, yoyo: true`). |
| **`DecryptedText` con rejilla anti-vibración** | **Diferido a Hito 1+** | No requerido en el showcase institucional de 15 s. | Para locuciones con énfasis de palabras en Hito 1 se recomienda pre-medir celdas fijas con `window.__hyperframes.fitTextFontSize` / `tabular-nums`. |
| **`LogoLoop` / `TechnologyLoop`** | **Diferido a Hito 1+** | No incluido en Hito 0B para no sobrecargar las 3 escenas demostrativas. | Queda reservado para piezas de producto o casos de éxito que muestren stack tecnológico en marquis determinista. |
| **`WarpText` WebGL (`ogl`)** | **Diferido a Hito 1+** | No implementado (no montado tampoco en la web principal actual). | Si se incorpora en futuros videos, deberá engancharse vía evento `hf-seek`. |
| **Acordeones FAQ** | **Diferido a Hito 1+** | Patrón web interactivo adaptable a módulos educativos pregunta/respuesta en Hito 1+. | N/A en Hito 0B. |

---

## 4. Verificación automática por sidecar (`index.motion.json`)

El archivo [index.motion.json](../project/index.motion.json) ejecuta aserciones automáticas sobre la línea de tiempo seekeada:
- `appearsBy`: `#s1-eyebrow` (`<= 0.5 s`) y `#s1-title` (`<= 1.0 s`).
- `before`: orden estricto entre `#s1-title` y `#s1-spec-a`.
- `staysInFrame`: `#s1-safe`, `#s2-safe` y `#s3-safe` permanecen dentro de `1080 × 1920` durante los 15 segundos completos.
- `keepsMoving`: verifica ausencia de tramos congelados más allá del umbral de craft.
