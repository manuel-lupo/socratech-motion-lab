# Auditoría de Identidad Visual — Socratech (`BRAND_AUDIT.md`)

**Proyecto:** Socratech Motion Lab (Hito 0A — Auditoría de Identidad Visual)  
**Fuente auditada:**
- Proyecto Web: `/home/mkayy/Documents/Projects/socratech`
- Isotipo oficial: `/home/mkayy/Documents/Projects/socratech/public/logo.svg`
- Tarjetas comerciales (PDF y SVGs): `/home/mkayy/Downloads/Socratech — Tarjetas de presentación _ Oscura + Clara.pdf` y `/home/mkayy/Downloads/Socratech — Tarjetas de presentación _ Oscura + Clara.zip`
- Capturas mobile reales: `/home/mkayy/Downloads/WhatsApp Image 2026-11-24 at 1.03.56 PM.jpeg` y `/home/mkayy/Downloads/WhatsApp Image 2026-11-24 at 1.03.56 PM (1).jpeg`
- QR oficial: `/home/mkayy/Downloads/qr_socratech_sin_logo_transparente.png` y `/home/mkayy/Downloads/WhatsApp Image 2026-11-22 at 11.10.24 PM.jpeg`

> **Leyenda de certeza utilizada en este documento:**
> - **[CONFIRMADO]**: Datos extraídos directamente del código fuente, hojas de estilo, archivos SVG o recursos oficiales inspeccionados.
> - **[INFERIDO]**: Interpretaciones visuales, equivalencias tipográficas no declaradas en metadatos o criterios de diseño deducidos de la inspección conjunta.
> - **[PENDIENTE]**: Decisiones de marca o artefactos faltantes que requieren confirmación humana o entrega posterior.

---

## 1. Resumen Ejecutivo y Hallazgo Crítico: Dualidad Cromática (Web vs. Tarjetas)

### 1.1 Diagnóstico de marca
**[CONFIRMADO]** Socratech posee una identidad visual sólida y coherente en sus **motivos geométricos** (moneda del pensador calada, órbitas concéntricas con satélites, diálogo bicolor en dos líneas), su **tono verbal** (*"Entender primero. Resolver mejor."*, *"Solo sé que no sé nada…"*, *"Del diálogo al código."*) y su **estructura tipográfica** (sans-serif geométrica/humanista limpia en mayúsculas para marca y eslogan, y titulares en oración con énfasis de color en el remate).

Sin embargo, la auditoría reveló un **hallazgo crítico**: existen **dos sistemas cromáticos distintos** conviviendo entre el sitio web y las tarjetas de presentación exportadas de Figma:

| Dimensión | Sistema 1 — Digital / Web (`/home/mkayy/Documents/Projects/socratech`) | Sistema 2 — Tarjetas Comerciales / Figma (`Socratech — Tarjetas de presentación...`) |
| :--- | :--- | :--- |
| **Fuente** | `app/globals.css` (L7–33) **[CONFIRMADO]** | SVGs exportados de Figma (`01 · Oscura` a `04 · Clara`) y PDF **[CONFIRMADO]** |
| **Oscuro principal (Ink / Navy)** | `#071F64` (Índigo profundo) | `#101A39` (fondo oscura), `#121D42` (texto clara), `#10204D` (trazos clara) |
| **Claro principal (Paper / Ivory)** | `#F4F5F0` (Papel cálido) / `#FFFFFF` (Cards) | `#FBFBF4` (Marfil cálido) / `#FFFFFF` (Textos en dorso oscura) |
| **Secundario / Muted** | `#E4E9F5` (Mist), `#4B5A86` (claros), `#9FB0DD` (oscuros) | `#949EB9` (oscuros), `#56607B` (claros) |
| **Color de Acento** | `#218487` (Teal / Verde azulado socrático) | `#CEEF62` (Lima eléctrico / Chartreuse) |
| **Slogan / Énfasis en titular** | Mismo peso/estilo en `#218487` (`Hero`, `SectionHeading`) | Relleno `#CEEF62` con contorno exterior de `1px` (`stroke-width="2"` enmascarado) en `#56607B` o `#10204D` |
| **Elemento separador de marca** | No usa barra bajo el logo en header/footer | Barra redondeada acento `#CEEF62` (`210×7px` en frente, `83×8px` en dorso) |

### 1.2 Directriz de marca confirmada para Socratech Motion Lab
- **[CONFIRMADO — Directriz de Marca]** Se prioriza de forma estricta la **Paleta de las Tarjetas Comerciales** como **fuente de verdad cromática oficial** para Socratech Motion Lab:
  - **Oscuro principal (Navy):** `#101A39` (fondos oscuros e isotipo sobre claro), `#121D42` (texto principal sobre claro) y `#10204D` (trazos, iconos y contorno exterior sobre claro).
  - **Claro principal (Warm Ivory):** `#FBFBF4` (fondos claros, isotipo y titulares sobre oscuro) y `#FFFFFF` (texto de contacto sobre oscuro).
  - **Acento eléctrico (Lime / Chartreuse):** `#CEEF62` (anillo del isotipo en versión oscura, punto satélite, barras divisorias, relleno de palabras clave, iconos en oscuro, marca de agua al `0.075` y bloques de esquina).
  - **Secundarios (Muted Slate):** `#949EB9` (texto secundario y contorno sobre oscuro) y `#56607B` (texto secundario sobre claro y contorno de `RESOLVER MEJOR.` sobre oscuro).
- **[CONFIRMADO]** El proyecto web (`/home/mkayy/Documents/Projects/socratech`) aporta la arquitectura de componentes, el sistema tipográfico (`Manrope` + monospace), los motivos geométricos (órbitas, asterisco, consola, grilla hairline) y la gramática de movimiento; sin embargo, sus colores (`#071F64`, `#F4F5F0`, `#E4E9F5`, `#218487`) quedan documentados como **paleta legacy del sitio web** y deben mapearse a la paleta oficial de las tarjetas en Motion Lab.
- **[PENDIENTE]** Confirmar si en Motion Lab debe mantenerse el símbolo `®` después de `SOCRATECH` (presente en `components/site/logo.tsx` L17 y ausente en las tarjetas comerciales).

---

## 2. Auditoría del Código y Arquitectura del Proyecto Web

### 2.1 Stack tecnológico y dependencias
Extraído de `/home/mkayy/Documents/Projects/socratech/package.json`, `components.json`, `next.config.mjs`, `postcss.config.mjs` y `wrangler.jsonc` **[CONFIRMADO]**:

- **Framework:** Next.js `16.4.3` con exportación estática (`output: 'export'`, `images: { unoptimized: true }`, salida en `out/`).
- **UI Runtime:** React `^19`, `@base-ui/react` `^1.5.0`, `shadcn` `^4.11.0` (estilo `base-nova`, `iconLibrary: "lucide"`, aliases `@/components`, `@/lib`, `@/components/ui`).
- **Estilos:** Tailwind CSS `^4.3.3` vía `@tailwindcss/postcss` `^4.3.3` y `tw-animate-css` `^1.4.0`. No utiliza archivos `.scss` ni `tailwind.config.*`; toda la configuración de tokens y `@theme inline` reside en `app/globals.css`.
- **Animación y Gráficos:** `motion` `^14.9.1` (usado en `components/site/decrypted-text.tsx`), `ogl` `^1.0.11` (WebGL 2 shader en `components/site/warp-text.tsx`, no montado en `app/page.tsx`), Web Animations API nativa (`components/site/horizontal-experience.tsx` y `components/site/services.tsx`), y keyframes CSS en `app/globals.css`.
- **Iconografía:** `lucide-react` `^1.16.0` (iconos de interfaz y motivos de marca) y `react-icons` `^5.7.0` (`react-icons/si` en `components/site/technology-loop.tsx`).
- **Despliegue:** Cloudflare Workers (`wrangler.jsonc`, worker `socratechweb`, `assets.directory: "./out"`).

### 2.2 Estructura de archivos del proyecto web
**[CONFIRMADO]**
- `app/layout.tsx`: Fuente Google `Manrope` (`variable: '--font-manrope'`), metadata SEO/OG (`es_AR`), favicon `/logo.svg`, `themeColor: '#071f64'`.
- `app/globals.css`: Tokens `:root`, `@theme inline`, keyframes globales, layout de `.journey-bar`, experiencia `.horizontal-track[data-pager]`, refinamientos de `#inicio`, diálogo `.service-dialog-wilma`, acordeones `.faq-item` / `.method-step-expansion`, carrusel `.method-mobile` y media queries responsive (`678` líneas).
- `app/page.tsx`: Ensambla `<SiteHeader />` + `<HorizontalExperience>` con 7 capítulos en orden fijo.
- `lib/site.ts`: Constante `CONTACT_EMAIL` (`'hola@socratech.com.ar'`) y `NAV_LINKS` (4 enlaces).
- `lib/utils.ts`: Helper `cn()` con `clsx` + `tailwind-merge`.
- `components/site/*`: 16 componentes/CSS específicos del sitio.
- `components/ui/button.tsx`: Componente base shadcn (disponible en el proyecto, aunque los CTAs del sitio usan clases Tailwind/CSS directas con `rounded-full`).

### 2.3 Arquitectura de capítulos y ritmo claro/oscuro
En `app/page.tsx` y `app/globals.css` (L204, L541), el sitio web alterna fondos oscuros (`--ink`) y claros (`--background` / `--secondary`) a lo largo de 7 capítulos **[CONFIRMADO]**:

| Orden | ID / Capítulo | Componente | Superficie / Fondo | Texto principal | Texto secundario |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 01 | `#inicio` | `Hero` (`hero.tsx`) | Oscuro `bg-ink` (`#071F64`) | `#F4F5F0` | `#9FB0DD` / `#E3E9F8` |
| 02 | `#soluciones` | `Services` (`services.tsx`) | Claro `bg-background` (`#F4F5F0`) | `#071F64` | `#4B5A86` |
| 03 | `#metodo` | `Method` (`method.tsx`) | Oscuro `bg-ink` (`#071F64`) | `#F4F5F0` | `#9FB0DD` |
| 04 | `#trabajos` | `Work` (`work.tsx`) | Claro Tintado `bg-secondary` (`#E4E9F5`) | `#071F64` | `#4B5A86` |
| 05 | `#nosotros` | `Principles` (`principles.tsx`) | Claro `bg-background` (`#F4F5F0`) + panel `bg-card` (`#FFFFFF`) | `#071F64` | `#4B5A86` |
| 06 | `#preguntas` | `Faq` (`faq.tsx`) | Claro `bg-background` (`#F4F5F0`) | `#071F64` | `#4B5A86` |
| 07 | `#contacto` | `Contact` + `SiteFooter` (`contact.tsx`, `site-footer.tsx`) | Oscuro `bg-ink` (`#071F64`) | `#F4F5F0` | `#9FB0DD` |

---

## 3. Extracción de Identidad Visual

### 3.1 Tipografía y jerarquías
- **[CONFIRMADO]** Fuente única en la web (`app/layout.tsx` L2–5, `app/globals.css` L36–37): **Manrope** (`subsets: ['latin']`), asignada tanto a `--font-sans` como a `--font-serif`. Para bloques de código en `#metodo` se usa `font-mono` (pila monospace del sistema).
- **[CONFIRMADO]** Pesos activos detectados en clases y estilos: `400` (código/body), `500` (`font-medium` en cita hero y eslogan del footer), `600` (`font-semibold` en H1/H2/botones secundarios/verbos), `700` (`font-bold` en eyebrows, H3, CTAs primarios, etiquetas), `800` (`font-extrabold` en wordmark `SOCRATECH` de `logo.tsx` y `WarpText`).
- **[INFERIDO]** En las tarjetas comerciales exportadas de Figma (`01 · Oscura / Frente.svg`, etc.), todo el texto está convertido a trazados vectoriales (`<path>`). Comparando la anatomía de los glifos (`S`, `C`, `R`, `g` de doble piso o simple, barra de `t`, terminales planos horizontales en `C`/`S`) con tipografías estándar de Figma, el wordmark y los textos de las tarjetas coinciden con **Inter** (fuente por defecto de Figma), aunque en la implementación web oficial fue reemplazada deliberadamente por **Manrope**.
- **[CONFIRMADO]** Tratamiento de titulares (`SectionHeading` en `section-heading.tsx`, `Hero` en `hero.tsx`, `Contact` en `contact.tsx`, `Faq` en `faq.tsx`):
  - Todos los titulares principales siguen el patrón **"Setup en color base + Remate conceptual en color acento"**:
    - `"Entender primero. Resolver"` (`#F4F5F0`) + `"mejor."` (`#218487`)
    - `"Tu desafío."` (`#071F64`) + `"Nuestra próxima buena pregunta."` (`#218487`)
    - `"Del diálogo"` (`#F4F5F0`) + `"al código."` (`#218487`)
    - `"Menos promesas."` (`#071F64`) + `"Más cosas hechas."` (`#218487`)
    - `"Lo que podés"` (`#071F64`) + `"esperar de nosotros."` (`#218487`)
    - `"Las preguntas"` (`#071F64`) + `"también son tuyas."` (`#218487`)
    - `"Todo empieza con una"` (`#F4F5F0`) + `"buena conversación."` (`#218487`)
    - En tarjetas (`Dorso.svg`): `"Contanos tu"` (`#FBFBF4` / `#121D42`) + `"idea."` (`#CEEF62` con borde `#949EB9` / `#10204D`).
  - Uso de tracking negativo ajustado en titulares (`-0.055em` en `#inicio h1`, `-0.04em` en `.horizontal-chapter h2` mobile y `.service-dialog h2`, `tracking-tight` `-0.025em` en `SectionHeading`) frente a tracking amplio en eyebrows y badges (`0.15em` a `0.25em`, `uppercase`).

### 3.2 Formas geométricas características y tratamiento de fondos
1. **Sistema Orbital (Círculos y Satélites) [CONFIRMADO]**:
   - En `hero.tsx` (L56–68): Contenedor `aspect-square` con dos órbitas concéntricas alrededor del isotipo (`inset-[20%]`, `size-[60%]`):
     - Órbita externa (`inset-0`): `rounded-full border border-dashed border-ink-border`, satélite circular superior `size-2.5` (`10px`) en `bg-accent` (`#218487`).
     - Órbita interna (`inset-[9%]`): `rounded-full border border-ink-border` (línea sólida), satélite circular inferior-izquierdo `size-2` (`8px`) en `bg-ink-muted` (`#9FB0DD`).
     - Satélite Asterisco inferior-derecho (`bottom-[8%] right-[4%]`): `<Asterisk className="size-14 text-accent" strokeWidth={3} />`.
   - En tarjetas comerciales (`Frente.svg` y `Dorso.svg`, `850×470`):
     - Anillo concéntrico alrededor del isotipo en `(192, 230)` de radio `119.35` (`stroke-width="1.3"`).
     - Tres grandes arcos orbitales de fondo (`stroke-width="1.3"`): esquina superior derecha (`cx=850, cy=10, r=239.35` y `cx=830, cy=0, r=174.35`) y esquina inferior izquierda (`cx=40, cy=580, r=239.35`), con opacidades sutiles (`0.18`, `0.12`, `0.13` en oscura; `0.09`, `0.08`, `0.10` en clara).
     - Satélite único sólido de color acento en esquina superior derecha (`cx=767, cy=85, r=7, fill="#CEEF62"`).
2. **El Asterisco Socrático [CONFIRMADO]**:
   - Icono `<Asterisk />` de `lucide-react` usado sistemáticamente como firma gráfica en color `--accent` (`#218487`): en eyebrows (`size-5`), en órbita del Hero (`size-14`, `strokeWidth={3}`) y encabezando los 4 principios en `#nosotros` (`size-6`, `strokeWidth={3}`).
3. **Pastilla / Barra Divisoria de Acento [CONFIRMADO]**:
   - Exclusiva de las tarjetas comerciales (`Frente.svg`: `width="210" height="7" rx="3" fill="#CEEF62"`; `Dorso.svg`: `width="83" height="8" rx="3" fill="#CEEF62"`), más un bloque geométrico sólido en la esquina inferior derecha de las 4 caras (`x="760" y="416" width="90" height="54" fill="#CEEF62"`).
4. **Marca de agua del Isotipo [CONFIRMADO]**:
   - En `Dorso.svg` (ambas versiones), el isotipo ampliado (`~585×612px` efectivo) se ubica detrás del código QR a `opacity="0.075"`, sangrado fuera de los bordes derecho, superior e inferior.
5. **Fondos lisos sin degradados complejos [CONFIRMADO]**:
   - Las superficies principales son colores planos sólidos (`#071F64`, `#F4F5F0`, `#E4E9F5`, `#FFFFFF`, `#101A39`, `#FBFBF4`). El único tratamiento de blur/transparencia ocurre en la barra superior (`bg-ink/95 backdrop-blur`), el menú móvil (`#071f64fa`, `backdrop-filter: blur(16px)`), la barra inferior `.journey-bar` (`#071f64f5`, `backdrop-filter: blur(12px)`), el backdrop del modal (`rgb(3 13 43 / 65%) backdrop-filter: blur(7px)`), la consola móvil (`rgb(0 0 0 / 8%)`) y la pastilla de legibilidad de `.hero-quote` (`rgb(7 31 100 / 18%)`).

### 3.3 Estilo de botones, tarjetas, bordes y separadores
**[CONFIRMADO]**
- **Botones de Acción (CTAs):** Forma píldora completa (`rounded-full`).
  - *Primario:* `bg-accent text-accent-foreground font-bold px-7 py-4` (`px-5 py-2.5 text-sm` en header). Hover: `hover:-translate-y-0.5` + flecha `group-hover:translate-x-1`.
  - *Secundario sobre oscuro:* `border border-ink-border rounded-full px-7 py-4 font-semibold`, hover `hover:border-ink-muted`.
  - *Primario sobre claro (`#trabajos`):* `bg-primary text-primary-foreground rounded-full px-6 py-3.5 font-bold hover:bg-accent hover:text-accent-foreground`.
  - *Botones de control circular:* `rounded-full border border-ink-border` (o `border-border`) de `size-10` / `36px–40px` (`Menu`, `.journey-arrows`, `.faq-plus`, `.service-dialog-close`, `.method-mobile-controls`).
  - *Píldoras de selección (Formulario `#contacto`):* `rounded-full border px-4 py-2 text-sm`, estado inactivo `border-ink-border text-ink-muted`, activo `border-accent bg-accent font-semibold text-accent-foreground`.
- **Tarjetas y Contenedores:**
  - *Grilla de Servicios (`#soluciones`):* Contenedor único `rounded-2xl border border-border bg-border gap-px overflow-hidden` (técnica *hairline grid* con separadores de `1px`). Celdas `bg-background p-8 hover:bg-card` con caja de icono `size-12 rounded-xl bg-primary` (cambia a `bg-accent` en hover) y tags `rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wider`.
  - *Modal de Servicios (`service-dialog-wilma`):* `rounded-[24px]`, fondo `#F4F5F0`, contorno SVG superpuesto (`stroke: #218487; stroke-width: 2`), bloque de ejemplo con acento lateral izquierdo `border-left: 3px solid #218487; background: #E4E9F5; border-radius: 0 10px 10px 0`.
  - *Consola (`#metodo`):* `rounded-2xl border border-ink-border bg-ink shadow-2xl shadow-black/30` (desktop) / `rounded-[14px] border border-ink-border bg-[rgb(0_0_0/8%)]` (mobile), cabecera con 3 puntos indicadores (`● ● ●`, tercero en `bg-accent`), nombre de archivo en `font-mono` y contador `Paso X / 4`.
  - *Tarjetas de Principios (`#nosotros`):* Sin fondo ni bordes laterales; separador superior grueso `border-t-2 border-primary pt-6` (verificado visualmente en la captura mobile `WhatsApp Image 2026-11-24 at 1.03.56 PM (1).jpeg`).
  - *Panel de Tecnologías (`#nosotros`):* `rounded-2xl bg-card p-8` (único bloque blanco `#FFFFFF` sobre fondo `#F4F5F0`).
  - *Preguntas Frecuentes (`#preguntas`):* Lista vertical separada por líneas finas `border-bottom: 1px solid var(--border)` (`border-top` en el primer ítem).
  - *Formulario de Contacto (`#contacto`):* Contenedor `rounded-2xl border border-ink-border p-6 md:p-8` e inputs `rounded-xl border border-ink-border bg-transparent`.

### 3.4 Diferencias entre Desktop y Mobile
**[CONFIRMADO]** Documentado en `app/globals.css` y `components/site/horizontal-experience.tsx` + `method.tsx`, y corroborado en las capturas mobile:

| Aspecto | Desktop (`>= 1024px`) | Tablet (`640px–1023px`) / Mobile (`< 640px`) |
| :--- | :--- | :--- |
| **Navegación de capítulos** | Pager de diapositivas cubrientes (`data-pager`) controlado por rueda, teclado, flechas o `.journey-bar` fija inferior (`56px`). Sin scroll interno: `fitDesktop` escala el contenido (`content.style.scale`) para que quepa en `100dvh - 128px`. | Mismo sistema de diapositivas cubrientes (`data-pager`, `globals.css` L536–543) con scroll vertical nativo dentro de cada capítulo si excede el alto. `.journey-bar` está oculta (`display: none`). Header reducido de `72px` a `68px`. |
| **Botón de continuación** | `.chapter-continue` fijo al pie (`height: 52px`), píldora `"Seguimos [Capítulo]"` con círculo teal y flecha animada. | `.chapter-continue` reducido (`height: 48px` en Hero/Método `<640px`, `button min-height: 36px`), centrado al pie. |
| **Composición del Hero** | 2 columnas (`grid-template-columns: minmax(0,1.45fr) minmax(0,1fr)`): texto a la izquierda, sistema orbital + isotipo a la derecha. Muestra `.hero-quote` y `.hero-orbit-caption`. | `< 640px`: columna única; el bloque orbital pasa arriba (`order: -1`, `width: clamp(150px, 27dvh, 220px)`), se oculta `.hero-orbit-caption` (`display: none`), `.hero-quote` se ubica sobre la órbita superior en `10px`, botones CTA en 2 columnas iguales (`grid-template-columns: minmax(0,1fr) minmax(0,1fr)`). En `< 360px` los CTAs se apilan en 1 columna. |
| **Sección `#metodo`** | `.method-desktop`: lista vertical de tabs a la izquierda (`1fr`) con acordeón animado + panel de consola sticky a la derecha (`1.2fr`). Auto-avance cada `8000ms`. | `.method-mobile`: carrusel horizontal circular (`scroll-snap-type: x mandatory`) con botones Anterior/Siguiente/Pausa, indicación `"Deslizá para explorar ↔"`, puntos inferiores y consola de ancho completo ajustada al viewport. |
| **Grilla de Servicios** | 3 columnas (`lg:grid-cols-3`). | 2 columnas en tablet (`sm:grid-cols-2`), 1 columna apilada en mobile (`< 640px`). |
| **Sección `#trabajos`** | 2 columnas (`lg:grid-cols-2`, override en `globals.css` L674), imagen `clamp(160px, 25vh, 280px)`. | 1 columna, imagen `aspect-ratio: 16/10`. |
| **Sección `#nosotros`** | 4 columnas (`lg:grid-cols-4`). | 2 columnas en `md:`, 1 columna en `< 768px` (confirmado en captura). |
| **Tipografía H1 Hero** | `clamp(48px, 5.2vw, 80px)` (`48px–70px` si alto `<= 800px`). | `clamp(27px, 8vw, 43px)` (`<= 639px` con `data-pager`) / `clamp(34px, 4.6vw, 48px)` (`640–1023px`). |

---

## 4. Análisis del Logo e Instrucciones de Lockup Provisional

### 4.1 Fuente de verdad del isotipo (`public/logo.svg`)
**[CONFIRMADO]** El archivo `/home/mkayy/Documents/Projects/socratech/public/logo.svg` es la única fuente de verdad del isotipo:
- `viewBox="0 0 580 590"`, relleno único `#071F64`, `fill-rule="evenodd"`.
- Geometría del `<path>`: bounding box exacto `x ∈ [19, 563]` (ancho `544`), `y ∈ [17, 573]` (alto `556`), centro óptico/geométrico en `(291, 295)`.
- Consta de 8 sub-trazados: el disco exterior con el perfil inferior-izquierdo recortado (brazo/mano y busto del pensador) más 7 recortes interiores que forman los ojos/cejas, nariz, bigote, barba y mano pensante.
- En las tarjetas comerciales (`Frente.svg`), el mismo `<path>` aparece escalado exactamente a `0.30×` (`161.028 × 166.8px`), sin alteración de silueta, centrado en `(193.445, 229.5)`.
- **Regla estricta:** **Nunca redibujar, simplificar, rellenar manualmente los huecos ni reemplazar el isotipo.**

### 4.2 Regla de Polaridad ("Moneda y Pensador")
**[CONFIRMADO]** Dado que el pensador está **calado (transparente)** dentro del disco sólido (`fill-rule="evenodd"`), el rostro y la mano siempre heredan el color del fondo detrás del SVG:
- **Sobre fondo oscuro (`#071F64` o `#101A39`):** Renderizar el path del isotipo en **blanco/papel** (`#F4F5F0`, `#FBFBF4` o `#FFFFFF`; en la web se aplica CSS `brightness-0 invert` sobre `#071F64`, logrando `#FFFFFF` puro). Resultado visual: **moneda clara con pensador oscuro**.
- **Sobre fondo claro (`#F4F5F0` o `#FBFBF4`):** Renderizar el path del isotipo en **índigo/navy** (`#071F64` en tema web o `#101A39` en tema tarjeta). Resultado visual: **moneda oscura con pensador claro**.

### 4.3 Tratamiento tipográfico del nombre `SOCRATECH` y el eslogan
- **Web (`components/site/logo.tsx` L12–20) [CONFIRMADO]:**
  - Texto en `Manrope`, peso `800` (`font-extrabold`), tamaño `18px` (`text-lg`), `letter-spacing: 0.12em` (`tracking-[0.12em]`), todo en mayúsculas `SOCRATECH`, con superíndice `®` (`text-[0.55rem]` = `8.8px`, peso `600`, `ml-0.5`).
  - Separación isotipo-texto: `12px` (`gap-3`) para un isotipo de `36×36px` (`size-9`).
- **Tarjetas comerciales (`01 · Oscura / Frente.svg` y `03 · Clara / Frente.svg`) [CONFIRMADO / INFERIDO]:**
  - Sin `®`. Texto en mayúsculas con cap-height `48px` (aprox. `font-size: 66px`), grosor de asta vertical `10.15px`, espaciado compacto entre letras (`~0.04em` [INFERIDO]).
  - En tarjetas, el eslogan aparece en dos líneas independientes debajo de una barra horizontal de acento `#CEEF62` (`210×7px`):
    - Línea 1: `ENTENDER PRIMERO.` (cap-height `18.91px`, relleno sólido `#FBFBF4` en oscura / `#121D42` en clara).
    - Línea 2: `RESOLVER MEJOR.` (cap-height `18.91px`, relleno `#CEEF62` con contorno exterior de `1px` en `#56607B` en oscura / `#10204D` en clara).
  - **[INFERIDO]** Para **Socratech Motion Lab**, la tipografía oficial de implementación debe ser **Manrope** (única tipografía declarada en el código web) en peso `800` (wordmark) y `700` (eslogan), evitando el outline de `1px` sobre tamaños pequeños en video salvo en tarjetas de alta resolución/escala tarjeta para preservar legibilidad tras compresión H.264/H.265.

### 4.4 Especificación del Lockup Provisional (No Oficial)
> **ADVERTENCIA:** No existe un archivo SVG oficial del logotipo completo (isotipo + wordmark + eslogan). Cualquier composición construida a partir de estas proporciones debe documentarse y tratarse como **lockup provisional parametrizado** para piezas de motion graphics.

Se definen dos lockups provisionales ensamblados con elementos independientes (el `<svg>` intacto de `public/logo.svg` + capas de texto/formas separadas):

#### A. Lockup Compacto / Mosca / Header (basado en `components/site/logo.tsx` [CONFIRMADO])
Tomando `U = tamaño del isotipo` (en web `U = 36px`):
- **Isotipo:** `1.00 U × 1.00 U`.
- **Gap horizontal:** `0.333 U` (`12px` en base `36px`).
- **Wordmark `SOCRATECH`:** Fuente `Manrope`, peso `800`, `font-size: 0.50 U` (`18px`), `letter-spacing: 0.12em`, alineado verticalmente al centro del isotipo (`items-center`).
- **Superíndice `®` (opcional según confirmación pendiente):** `font-size: 0.244 U` (`8.8px`), peso `600`, `margin-left: 0.055 U`.

#### B. Lockup Completo / Intro & Outro (basado en proporciones exactas de `Frente.svg` [CONFIRMADO])
Tomando **`D` = altura del disco del isotipo** (en `Frente.svg`, `D = 166.8px` dentro de un lienzo `850×470`):
1. **Isotipo (`public/logo.svg` intacto):** Alto `1.000 D` (ancho `0.965 D`), centrado en `(0, 0)`. Polaridad oficial de tarjeta: `#FBFBF4` sobre fondo oscuro (`#101A39`) o `#101A39` sobre fondo claro (`#FBFBF4`).
2. **Anillo orbital contenedor:** Círculo concéntrico de diámetro `1.431 D` (`r = 0.7155 D`), `stroke-width: 0.0078 D` (`1.3px` en tarjeta; en video 1080p/4K elevar a mínimo `2px–3px` para evitar aliasing **[INFERIDO]**). Color oficial de tarjeta: `#CEEF62` sobre fondo oscuro (`#101A39`), `#101A39` sobre fondo claro (`#FBFBF4`). *(Legacy web: `#218487` o `#9FB0DD` sobre `#071F64`).*
3. **Posición horizontal del bloque de texto:** Comienza a `0.504 D` a la derecha del borde derecho del disco del isotipo (`0.278 D` a la derecha del anillo orbital).
4. **Wordmark `SOCRATECH`:**
   - Fuente: `Manrope`, peso `800` (o `700`), mayúsculas.
   - Cap-height: `0.288 D` (`font-size ≈ 0.395 D`, pues el cap-height de Manrope es ~73% del em-square **[INFERIDO]**).
   - `letter-spacing`: `0.06em` (compromiso entre `0.04em` compacto de tarjeta y `0.12em` del header web **[INFERIDO]**).
   - Color oficial de tarjeta: `#FBFBF4` sobre oscuro / `#121D42` sobre claro.
   - Alineación vertical: borde superior a `-0.363 D` respecto al centro del isotipo; línea base a `-0.075 D`.
5. **Barra divisoria de acento:**
   - Ubicada `0.162 D` debajo de la línea base de `SOCRATECH`.
   - Ancho: `1.259 D` (equivale al `~50%` del ancho total de `SOCRATECH`), alto: `0.042 D`, `border-radius: 0.018 D`.
   - Color oficial de tarjeta: `#CEEF62` *(Legacy web: `#218487`)*.
6. **Eslogan — Línea 1 (`ENTENDER PRIMERO.`):**
   - Ubicada `0.240 D` debajo del borde inferior de la barra divisoria.
   - Fuente: `Manrope`, peso `700`, mayúsculas, cap-height `0.113 D` (`font-size ≈ 0.155 D`), `letter-spacing: 0.06em`.
   - Color oficial de tarjeta: `#FBFBF4` sobre oscuro / `#121D42` sobre claro.
7. **Eslogan — Línea 2 (`RESOLVER MEJOR.`):**
   - Ubicada `0.120 D` debajo de la línea base de la Línea 1 (salto entre líneas base: `0.234 D`).
   - Misma tipografía, tamaño y tracking que la Línea 1.
   - Color oficial de tarjeta: relleno `#CEEF62` en ambas versiones, con contorno exterior de `1px` (`stroke-width: 2px` enmascarado al exterior) en `#56607B` sobre oscuro (`#101A39`) y en `#10204D` sobre claro (`#FBFBF4`) para asegurar contraste y separación cromática *(Legacy web: `#218487` sin contorno)*.
