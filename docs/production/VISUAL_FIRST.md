# Metodología oficial de producción: Visual-First

**Estado:** CONFIRMADO como estándar oficial de Socratech Motion Lab. Reemplaza al modelo Audio-First.
**Alcance:** todos los videos de `content/videos/`. V01 es el primer caso, no una excepción.

---

## 1. Principio

La generación visual **no depende** de una grabación de voz. El orden es:

```text
Guion aprobado → Storyboard + Timing plan → Video visual (HyperFrames) → Revisión visual
      → Grabación de voz sobre el video aprobado → Integración de audio y subtítulos → Render final
```

- El **guion** fija el contenido hablado.
- El **storyboard** fija la narrativa visual.
- El **timing plan** (`timing.json`) fija ritmo y duración objetivo.
- La **voz humana** se graba *después* de aprobar el video visual, siguiendo su ritmo.
- La voz sintética queda como posibilidad futura. **No está implementada ni autorizada.**

**Ausencia de audio = estado válido.** Ninguna etapa 1–4 requiere un archivo de audio, y ninguna herramienta debe tratarlo como error.

---

## 2. Las 7 etapas

| # | Etapa | Entrada | Salida | Compuerta de aprobación |
|---|---|---|---|---|
| 1 | **SCRIPT** | Brief, objetivo, público | `script-*.md` aprobado; segmentos narrativos con intención y mensaje | G1: guion aprobado por el equipo |
| 2 | **VISUAL PLANNING** | Guion, dirección artística, componentes, formato | `storyboard.md`, `timing.json`, `visual-direction.md` | G2: storyboard + timing aprobados |
| 3 | **VISUAL PRODUCTION** | Storyboard, timing, recursos, componentes | Composición HyperFrames, animaciones, transiciones, render visual preliminar **sin voz** | — |
| 4 | **VISUAL REVIEW** | Render preliminar | Informe de revisión; ajustes | G3: video visual aprobado (independiente del audio) |
| 5 | **VOICEOVER RECORDING** | Video visual aprobado (versión fijada) | Guía de locución con segmentos reales; WAV originales en `audio/` | G4: locución aprobada |
| 6 | **AUDIO INTEGRATION** | WAV, música/SFX opcionales | Mezcla; subtítulos sincronizados con la grabación definitiva; reconciliación de timing | — |
| 7 | **FINAL RENDER** | Todo lo anterior | Video final con audio y subtítulos, informe de validación, metadatos y versión | G5: entrega aprobada |

### Etapa 1 — SCRIPT
El guion es la fuente de verdad del contenido hablado. **No se modifica durante la producción visual sin aprobación.** Cualquier propuesta de cambio se documenta aparte y espera decisión.

### Etapa 2 — VISUAL PLANNING
El storyboard debe permitir construir el video **sin voz**. Responsabilidades (ver [TIMING_PLAN.md](./TIMING_PLAN.md)):
- `storyboard.md` → *qué se ve y por qué* (narrativa, componentes, animaciones, intención). **No contiene tiempos.**
- `timing.json` → *cuánto dura y cuándo ocurre* (duraciones, rangos, transiciones, puntos de sincronización, holds). Única fuente de verdad temporal.

### Etapa 3 — VISUAL PRODUCTION
Se ejecuta sin grabaciones. Subtítulos y voz **no** son requisito del render visual. Los componentes de marca y las animaciones institucionales no dependen del voiceover.

### Etapa 4 — VISUAL REVIEW
Se valida: claridad narrativa, ritmo, jerarquía, legibilidad, safe zones, coherencia de marca, duración, transiciones y calidad de animación. La aprobación visual es independiente de la de audio.

### Etapa 5 — VOICEOVER RECORDING
Se genera la guía de locución **a partir de la duración real del video aprobado** (versión de referencia fijada): segmentos, pausas, énfasis, entradas/salidas aproximadas. Grabación humana preferida. La locución no debe encajar "a cualquier costo": si necesita más espacio, se evalúan ajustes razonables del video (sección 4).

### Etapa 6 — AUDIO INTEGRATION
Voiceover, música y SFX si corresponde, silencios. Los **subtítulos definitivos se sincronizan con la grabación final** y nunca con estimaciones previas.

### Etapa 7 — FINAL RENDER
Entrega: video final, audio integrado, subtítulos, informe de validación, metadatos y versión de producción.

---

## 3. Qué se puede hacer sin audio

| Permitido sin WAV | Requiere WAV |
|---|---|
| Storyboard, timing plan, composición, render visual preliminar | Subtítulos definitivos |
| Revisión y aprobación visual | Mezcla y nivelación |
| Guía de locución (estimada sobre el video aprobado) | Reconciliación final de duraciones |
| Render con duración objetivo | Render final |

Los subtítulos **no** son prerrequisito del render visual. Si se necesitara un texto en pantalla durante la etapa 3, es texto de diseño definido en el storyboard, no subtítulo sincronizado.

---

## 4. Reconciliación voz ↔ video (etapa 5–6)

1. Medir la duración real de la toma elegida y de cada segmento. Registrarlas en `audio/take-log.md`.
2. Comparar contra cada escena de `timing.json`.
3. **Dentro de `[min, max]` de la escena:** ajustar `duration.target`, subir `revision` y anotar el cambio en `changelog`. No se reconstruye la composición.
4. **Fuera de rango:** no se recorta ni acelera la voz artificialmente. Se decide con el equipo: ampliar el rango, ajustar pausas de lectura, o modificar el storyboard. **Un cambio de guion requiere aprobación (G1).**
5. Los holds mínimos (p. ej. cierre institucional) no se sacrifican para encajar la voz.

**La única fuente de verdad de duraciones es `timing.json`.** Las mediciones de audio son datos de entrada, no un segundo plan temporal.

---

## 5. Versionado de entregables (PROPUESTO)

- Render visual preliminar: `video-generation/renders/<videoId>_visual_r<NN>.mp4` (no versionado en Git).
- La guía de locución registra la versión de referencia (`revision` de `timing.json` + nombre del render aprobado).
- Render final: `<videoId>_final_r<NN>.mp4`.

---

## 6. Documentos relacionados

- [TIMING_PLAN.md](./TIMING_PLAN.md) — arquitectura temporal, contrato y esquema.
- [../architecture/ADR-0001-visual-first.md](../architecture/ADR-0001-visual-first.md) — decisión.
- Plantillas: [content/templates/](../../content/templates/).
- Caso de referencia: [content/videos/001-sistemas-conectados/](../../content/videos/001-sistemas-conectados/).
