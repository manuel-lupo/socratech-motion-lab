# Recomendaciones de Motion Design — Socratech (`MOTION_RECOMMENDATIONS.md`)

**Proyecto:** Socratech Motion Lab (Hito 0A — Auditoría de Identidad Visual)  
**Objetivo:** Traducir los comportamientos cinéticos, curvas de aceleración y coreografías encontradas en `/home/mkayy/Documents/Projects/socratech` en un sistema de motion graphics reutilizable para video/HyperFrames.

---

## 1. Inventario de Animaciones Existentes en el Código Web **[CONFIRMADO]**

Todas las animaciones descritas a continuación existen y fueron verificadas en `app/globals.css`, `components/site/hero.tsx`, `horizontal-experience.tsx`, `services.tsx`, `method.tsx` y `faq.tsx`:

### 1.1 Secuencia de Apertura del Hero (`#inicio`)
Orquestada en `app/globals.css` (L379–388, L601) y `components/site/hero.tsx` (L9–75):

| Tiempo (`delay`) | Elemento | Duración | Curva (`easing`) | Transformación / Efecto |
| :--- | :--- | :--- | :--- | :--- |
| `0 ms` | `.hero-logo-entrance` (Isotipo + Órbitas) | `1100 ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | `opacity: 0 -> 1`, `translateX(80px) scale(0.94) -> 0 scale(1)`, `blur(8px) -> blur(0)` (`hero-logo-in`) |
| `800 ms` | `.hero-decrypted-title` (`<h1>`) | `900 ms` + tipeo | `ease` (implícito) | Entrada del bloque (`hero-information-in`: `translateY(22px) blur(5px) -> 0`) + montaje de `DecryptedText`: línea 1 (`speed=45ms`, `maxIterations=12`, `sequential`), línea 2 `"Resolver "` (`70ms`), `"mejor."` (`75ms`) |
| `1800 ms` | `.hero-quote` y `.hero-orbit-caption` | `900 ms` | `ease` (implícito) | `translateY(22px) blur(5px) -> 0` |
| `1900 ms` | `.hero-detail-eyebrow` | `900 ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | `translateY(22px) blur(5px) -> 0` |
| `2050 ms` | `.hero-detail-copy` | `900 ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Stagger `+150ms`, `translateY(22px) blur(5px) -> 0` |
| `2200 ms` | `.hero-detail-actions` | `900 ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Stagger `+150ms`, `translateY(22px) blur(5px) -> 0` |
| `2350 ms` | `.hero-detail-stats` (reservado) | `900 ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Stagger `+150ms` |
| `2700 ms` | `.chapter-continue` (botón "Seguimos") | `800 ms` | `ease` | `continue-reveal`: `opacity: 0 blur(4px) -> 1 blur(0)` |

### 1.2 Ciclos Continuos (Ambient Motion)
- **Órbita exterior punteada y Asterisco satélite** (`globals.css` L68, `hero.tsx` L57, L65): `orbit 60s linear infinite` (`rotate(360deg)`).
- **Órbita interior sólida** (`globals.css` L69, `hero.tsx` L60): `orbit 90s linear infinite reverse` (contrarrotante en proporción `3:2` respecto a la exterior).
- **Cursor de terminal** (`globals.css` L72, `method.tsx` L215): `blink 1.1s steps(1) infinite` (`50% { opacity: 0 }`).
- **Indicación de continuación** (`globals.css` L552–553): `continue-nudge 2.8s ease-in-out infinite` (pequeño pulso descendente `translateY(3px)` al 80% del ciclo).
- **Marquesina de tecnologías** (`technology-loop.tsx` L39): `LogoLoop` continuo a `45 px/s` hacia la izquierda con interpolación exponencial (`SMOOTH_TAU = 0.25`).

### 1.3 Transición entre Escenas — "Pager Cover" (`horizontal-experience.tsx` L78–98)
Inspirada en *Pager / Museum of Motion* (`README.md` L32):
- **Duración:** `1150 ms`.
- **Curva maestra de cámara:** `cubic-bezier(0.76, 0, 0.24, 1)` (entrada y salida pronunciadas).
- **Escena entrante (`z-index: 2`):** `translateY(±100%) -> translateY(0%)` (cubre completamente a la escena anterior).
- **Escena saliente (`z-index: 1`):** Paralaje al 30%: `translateY(0%) -> translateY(∓30%)`.
- **Respiración luminosa (`.chapter-breathe`):** `1450 ms ease-in-out` (`brightness(1) -> brightness(0.88)` entre 18%–65% `-> brightness(1)`).
- **Entrada escalonada del contenido de escena:** `850 ms`, delay `380 ms + min(i * 60 ms, 480 ms)`, curva `cubic-bezier(0.22, 0.61, 0.36, 1)`, con keyframes de asentamiento elástico sutil:
  - `0%`: `translateY(±48px)`, `opacity: 0`
  - `64%`: `translateY(∓9px)`, `opacity: 1` (sobrepaso suave)
  - `84%`: `translateY(±3px)`, `opacity: 1`
  - `100%`: `translateY(0)`, `opacity: 1`

### 1.4 Trazado Geométrico y Entradas Opuestas — "Wilma Dialog" (`globals.css` L226–246, `services.tsx`)
- **Overlay:** `800 ms ease` (`blur(0) -> blur(7px)`).
- **Dibujo de contorno SVG (`wilma-draw`):** `650 ms cubic-bezier(0.4, 0, 0.2, 1)` (`stroke-dashoffset: 1 -> 0` sobre `pathLength="1"`).
- **Relleno de tarjeta (`wilma-fill`):** `750 ms ease`, delay `300 ms` (`opacity: 0 -> 1`).
- **Bloques opuestos:**
  - *Izquierda (Eyebrow + Icono + Título)*: `800 ms`, delay `400 ms`, `cubic-bezier(0.22, 0.61, 0.36, 1)`, `translateX(-100px) -> 0`.
  - *Derecha (Botón CTA)*: `800 ms`, delay `400 ms`, `cubic-bezier(0.22, 0.61, 0.36, 1)`, `translateX(+100px) -> 0`.
  - *Centro (Cuerpo + Ejemplo)*: `750 ms ease`, delay `550 ms`, `translateY(8px) -> 0`.

### 1.5 Diálogo Lateral Alternado (`faq.tsx` L45, `method.tsx` L169–176, `globals.css` L276–300)
- **Apertura de contenedor:** `650 ms cubic-bezier(0.22, 0.61, 0.36, 1)` (`grid-template-rows: 0fr -> 1fr`).
- **Oraciones / Pares de diálogo:** Entran alternando origen lateral (`--entry-x: -35px` para índices pares y `+35px` para impares; en `method`, título desde `-35px` a `90ms` y cuerpo desde `+35px` a `190ms`).
- **Curva de diálogo:** `650 ms cubic-bezier(0.22, 0.8, 0.3, 1.12)` (overshoot sutil `1.12` en desplazamiento) + `opacity 400 ms ease`, con stagger de `100 ms` por oración.

### 1.6 Consola de Código (`method.tsx` L203–215)
- Cada línea entra con `fade-in slide-in-from-left-2` escalonada cada `60 ms` (`animationDelay: i * 60ms`), rematada con el cursor rectangular `animate-blink` en color acento.

---

## 2. Gramática Cinética para Socratech Motion Lab **[INFERIDO]**

### 2.1 Concepto rector: *"Del diálogo al código"*
El movimiento de Socratech debe sentirse **preciso, inteligente y conversacional**, evitando rebotes caricaturescos o transiciones caóticas. Cada recurso de animación del código simboliza una fase del método:
1. **Preguntar (Indagación):** Movimiento orbital continuo y desencriptación (`DecryptedText`) que busca sentido entre caracteres antes de fijar la respuesta.
2. **Dialogar (Contraste):** Entradas laterales opuestas (`-35px` vs `+35px` o `-100px` vs `+100px`) y titulares en dos tiempos/dos colores.
3. **Construir (Estructura):** Trazados de contorno (`stroke-dashoffset`), grillas de `1px`, terminales que imprimen línea por línea cada `60ms` y transiciones cubrientes limpias (*Pager Cover*).

### 2.2 Las 4 Curvas Maestras del Sistema

| Nombre de Curva | Definición `cubic-bezier` | Origen en web | Cuándo usar en Motion Lab |
| :--- | :--- | :--- | :--- |
| **`ease-noble-reveal`** | `cubic-bezier(0.16, 1, 0.3, 1)` | `.hero-logo-entrance`, reveals móviles | Entradas de isotipo, titulares principales y elementos con leve desenfoque (`blur`). |
| **`ease-pager-cover`** | `cubic-bezier(0.76, 0, 0.24, 1)` | `HorizontalExperience` (`go()`) | Cortes y transiciones de escena a pantalla completa con paralaje. |
| **`ease-structure-settle`** | `cubic-bezier(0.22, 0.61, 0.36, 1)` | `Wilma`, paneles, ítems de capítulo | Asentamiento de tarjetas, bloques de texto, contenedores y paneles UI. |
| **`ease-dialogue-spring`** | `cubic-bezier(0.22, 0.8, 0.3, 1.12)` | `.faq-answer-line`, `.method-step-*` | Micro-entradas laterales alternadas (conversación entre dos ideas/líneas). |

---

## 3. Recetas de Implementación para HyperFrames / Piezas de Video **[INFERIDO]**

> **Directriz cromática:** Todas las recetas siguientes toman como base oficial la **paleta de las tarjetas comerciales** (`#101A39` Navy, `#FBFBF4` Marfil, `#CEEF62` Lima eléctrico, `#121D42` / `#10204D` Navy texto/trazo, `#949EB9` / `#56607B` Slate). *(Los tonos `#071F64` / `#218487` / `#F4F5F0` quedan como referencia legacy del código web).*

### 3.1 Receta 1 — Intro / Outro de Marca (Lockup Provisional Animado, `~2.4s`)
Utilizando las proporciones del **Lockup Completo** ([BRAND_AUDIT.md](./BRAND_AUDIT.md) — `docs/brand/BRAND_AUDIT.md`, sección 4.4.B) sobre fondo oscuro `#101A39` (o fondo claro `#FBFBF4`):
1. **`0.00s – 0.65s` (Anillo e Isotipo):** Trazado del anillo orbital (`#CEEF62` sobre oscuro o `#101A39` sobre claro; `stroke-dashoffset: 1 -> 0`, `650ms`, `cubic-bezier(0.4, 0, 0.2, 1)`) simultáneo a la entrada del isotipo (`#FBFBF4` sobre `#101A39`, o `#101A39` sobre `#FBFBF4`) con `hero-logo-in` (`1100ms`, `ease-noble-reveal`).
2. **`0.45s – 1.10s` (Nombre `SOCRATECH`):** Desencriptación secuencial de los 9 caracteres de `SOCRATECH` (`#FBFBF4` sobre oscuro / `#121D42` sobre claro, a `40ms/char`, imitando `DecryptedText`) o barrido con `blur(6px) -> 0`.
3. **`0.85s – 1.30s` (Barra Divisoria):** Crecimiento de la píldora de acento `#CEEF62` (`rx: 3`) desde el borde izquierdo (`transform-origin: left`, `scaleX: 0 -> 1`, `450ms`, `ease-noble-reveal`).
4. **`1.05s – 1.85s` (Eslogan en Diálogo):**
   - `1.05s`: `ENTENDER PRIMERO.` (`#FBFBF4` sobre oscuro / `#121D42` sobre claro) entra desde la izquierda (`-35px -> 0`, `650ms`, `ease-dialogue-spring`).
   - `1.30s`: `RESOLVER MEJOR.` (relleno `#CEEF62` con contorno exterior fino de `1px` en `#56607B` sobre oscuro o `#10204D` sobre claro) entra desde la derecha (`+35px -> 0`, `650ms`, `ease-dialogue-spring`) o se desencripta como el Hero (`"mejor."`).
5. **`1.85s+` (Sostenimiento):** Satélite `#CEEF62` (`r=7`) y arcos orbitales de fondo (`opacity: 0.12–0.18` en `#CEEF62` sobre `#101A39`, u `0.08–0.10` en `#101A39` sobre `#FBFBF4`) rotando suavemente mientras el lockup permanece estable para lectura.

### 3.2 Receta 2 — Transición de Escena "Pager Cover" (Adaptación a Video)
- **Alternancia cromática obligatoria:** Pasar de una escena Oscura (`#101A39`) a una escena Clara (`#FBFBF4`) maximiza el impacto de la cortina cubriente y mantiene la dualidad exacta de las tarjetas Oscura + Clara.
- **Tiempos recomendados:**
  - *Piezas editoriales / web-paced (16:9):* `1150 ms` exactos como la web (`cubic-bezier(0.76, 0, 0.24, 1)`), escena saliente desplazándose `-30%` con caída de brillo (`brightness(0.88)`).
  - *Reels / Shorts / TikTok (9:16, ritmo ágil):* Comprimir la misma curva a `700 ms – 800 ms` manteniendo el ratio `100% / -30%` y adelantar el stagger del contenido entrante a `240 ms` + `50 ms` por bloque.

### 3.3 Receta 3 — Escalado de Velocidad Orbital para Video
**[INFERIDO]** En la web, las órbitas giran en `60s` y `90s` porque son fondos persistentes. En un video corto de `10s–30s`, una rotación de `60s` resulta casi imperceptible:
- **Recomendación:** Mantener siempre la relación `2:3` contrarrotante entre la órbita exterior y la interior, pero acelerar el periodo a **`18s` (exterior, `20°/s` horario)** y **`27s` (interior, `13.3°/s` antihorario)**.
- El `<Asterisk>` satélite o el punto satélite `#CEEF62` (`r=7`) puede girar solidario a su órbita; en caso de usar el `<Asterisk>`, rotar sobre su propio eje a `12s/rev` durante momentos de énfasis.

### 3.4 Receta 4 — Callouts y Tarjetas de Concepto ("Wilma Card")
Para explicar funcionalidades, métricas o casos de éxito (`Lavomil`, `El Rincón de Roma`):
1. Dibujar el perímetro rectangular redondeado (`rx: 24px`) en color `#CEEF62` (sobre oscuro) o `#10204D` (sobre claro) durante `550ms–650ms`.
2. Fundir el relleno de la tarjeta (`#FBFBF4` o `#101A39`) a partir del `50%` del trazado (`300ms`).
3. Deslizar icono + título desde `-60px` izquierda y la etiqueta/badge desde `+60px` derecha en `650ms` (`ease-structure-settle`).

### 3.5 Receta 5 — Escenas de "Consola Socrática" (`#metodo`)
- Mostrar el marco de terminal oscuro (`#101A39`, borde `rgba(148, 158, 185, 0.28)`), cabecera con 3 puntos (`● ● ●` con el tercero en `#CEEF62`) y extensión real (`.md`, `.yml`, `.ts`, `.log`).
- Revelar líneas secuencialmente cada `60ms–90ms` (o `120ms` si se sincroniza con locución).
- Usar colores semánticos estrictos de tarjeta: comentarios atenuados en itálica (`#949EB9` al 70%), claves en `#FBFBF4` / `#FFFFFF` `font-semibold`, y respuestas/validaciones (`→`, `✓`, cursor `animate-blink`, variables clave) en `#CEEF62`.

---

## 4. Guardrails Técnicos para Producción Audiovisual
1. **No distorsionar el isotipo:** Mantener `aspect-ratio` original (`580:590` o según bounding box `544:556`), respetar el calado transparente (polaridad `#FBFBF4` sobre `#101A39` y `#101A39` sobre `#FBFBF4`) y no aplicar glows neón ni sombras paralelas pesadas sobre él.
2. **Regla estricta de contraste para el Lima `#CEEF62`:**
   - **Sobre fondo oscuro (`#101A39`):** `#CEEF62` ofrece contraste alto y directo para titulares acentuados, iconos, barras, puntos satélites y cursor de terminal (opcionalmente con contorno fino `#56607B` o `#949EB9` en títulos display tal como en `01 · Oscura`).
   - **Sobre fondo claro (`#FBFBF4`):** **NUNCA** usar `#CEEF62` sin soporte para texto fino o líneas delgadas. Usarlo exclusivamente como relleno de bloques sólidos (ej. esquina `90×54`, barra divisoria `rx=3`, píldoras con texto `#101A39`) o en tipografía display **siempre acompañada de contorno exterior `#10204D`** (`1px–1.5px` exterior) tal como está diseñado en `03 · Clara / Frente.svg` y `04 · Clara / Dorso.svg`. Para texto corrido o iconos sobre claro, usar `#121D42`, `#10204D` o `#56607B`.
3. **Legibilidad del texto desencriptado:** En `DecryptedText`, las tarjetas/glífos encriptados usan escalado horizontal (`scaleX`) para no causar saltos de línea (*layout shift*). Al implementar en video, pre-calcular el ancho de caja de cada letra final o usar `tabular-nums` / celdas fijas para que la palabra `"mejor."` no vibre horizontalmente al desencriptarse.
4. **Safe Zones 9:16 y 16:9:** Al adaptar el Hero mobile (`WhatsApp Image 2026-11-24 at 1.03.56 PM.jpeg`) a video vertical `1080×1920`, respetar el orden vertical confirmado en móvil (Órbita arriba → Eyebrow con `*` → Titular bicolor → Copy/CTA), evitando que el texto orbital `"Solo sé que no sé nada..."` quede dentro del 15% superior cubierto por interfaces de Reels/Shorts.
