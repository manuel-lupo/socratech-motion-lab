# Arquitectura temporal: `timing.json`

**Propósito:** planificar el ritmo de un video **sin depender de audio**, permitiendo modificarlo sin reconstruir la composición.

---

## 1. Una sola fuente de verdad

| Documento | Responde | Contiene tiempos |
|---|---|---|
| `script-*.md` | ¿Qué se dice? | No (solo pausas sugeridas de lectura) |
| `storyboard.md` | ¿Qué se ve y por qué? | **No** |
| `timing.json` | ¿Cuánto dura y cuándo ocurre? | **Sí — única fuente** |
| `recording-guide.md` | ¿Cómo se graba? | Derivados/estimados de `timing.json`, nunca origen |
| `audio/take-log.md` | ¿Qué duró lo grabado? | Mediciones (datos de entrada) |

El storyboard y `timing.json` se vinculan por **`id` de escena** (`M01`…`M06`). Los resúmenes de tiempos se **generan** con `--table` (sección 5); no se copian a mano a otros documentos.

---

## 2. Modelo

Cada escena (`scenes[]`) expresa lo necesario, y los campos opcionales solo se usan cuando aportan valor:

| Campo | Oblig. | Descripción |
|---|---|---|
| `id`, `order` | sí | Identificador (vínculo con storyboard) y posición 1..N contigua |
| `system` | sí | `A` (Editorial Illustration), `B` (Socratech Technology) o `A>B` (transformación) |
| `narrativeFunction` | sí | Función narrativa |
| `duration.mode` | sí | `fixed` (min=target=max) o `flexible` |
| `duration.target/min/max` | sí | Segundos. `min ≤ target ≤ max` |
| `transitionOut` | no | `{type, duration}`; ocupa el **final** de la escena (igual que el *Pager Cover* de las composiciones aprobadas). Tipos: `none, cut, match-cut, zoom-out, transform, pager-cover, fade` |
| `syncPoints[]` | no | Hitos visuales `{id,label,at,span?}` |
| `readingMoments[]` | no | Momentos de lectura `{id,label,minHold}` |
| `constraints.minHoldSeconds` | no | Hold mínimo al final (p. ej. cierre institucional) |
| `dependsOn[]` | no | Escenas de las que hereda elementos visuales |
| `scriptBlocks[]` | no | Bloques del guion que cubre (referencia, **sin copiar texto**) |

### Posición de un `syncPoint` (`at`)
- `{anchor:"start", value:s}` → `s` segundos desde el inicio (fijo).
- `{anchor:"end", value:s}` → `s` segundos antes del final (fijo; ideal para holds y transiciones).
- `{anchor:"ratio", value:0..1}` → proporción de la duración (**elástico**: escala si la escena se alarga o acorta).

### Tipos de escena
1. **Fija:** `mode:"fixed"`.
2. **Flexible:** `mode:"flexible"` con rango.
3. **Animaciones extensibles / lectura:** puntos `ratio` + `readingMoments`.
4. **Transiciones dependientes del final:** `transitionOut` + `anchor:"end"`.
5. **Cierre con hold:** `constraints.minHoldSeconds`.

---

## 3. Reglas de validación (implementadas en `validate-timing.mjs`)

Errores: ids únicos y `order` contiguo; `min ≤ target ≤ max`; `fixed` coherente; `transitionOut.duration < min`; `Σ readingMoments.minHold + transición ≤ min`; `minHoldSeconds + transición ≤ min`; todo `syncPoint` cae dentro de la escena para `min` y `max`; `dependsOn` existente y no autorreferente; `Σ target` dentro de `totalDuration`; `Σ min ≤ totalDuration.max` y `Σ max ≥ totalDuration.min`.
Advertencias: límites de escena fuera de la grilla de frames (`1/fps`).
**La ausencia de audio nunca es error.** El esquema no tiene campo de audio.

---

## 4. Relación con HyperFrames (verificado con la skill `hyperframes` y la composición del Hito 0B)

- Las escenas son sub-composiciones montadas con `data-start`/`data-duration` consecutivos; una escena más corta que su *slot* mantiene el último frame.
- Los timelines internos usan segundos absolutos locales a la escena.
- **Las variables no pueden cambiar el `data-duration` de la raíz** (`format.md`), por lo que `timing.json` **no** se consume como variable en runtime.

**PROPUESTO (Hito 1B, aún no implementado):** un paso de *build* resuelve `timing.json` (`--json`) y **genera** los `data-start`/`data-duration` y los offsets de los tweens al construir la composición de V01. No se hará `fetch` en render (determinismo). Cambiar el ritmo = editar `timing.json` y regenerar.

---

## 5. Herramienta

```bash
node video-generation/scripts/validate-timing.mjs <timing.json>            # valida
node video-generation/scripts/validate-timing.mjs <timing.json> --table    # resumen legible
node video-generation/scripts/validate-timing.mjs <timing.json> --json     # resolución completa
node video-generation/scripts/validate-timing.mjs <timing.json> --set M02=10.5 --table   # simula otra duración (debe estar en rango)
```
Sin dependencias (solo Node). Esquema normativo: [`shared/contracts/timing.schema.json`](../../shared/contracts/timing.schema.json). El validador agrega verificaciones semánticas que JSON Schema no expresa; ante discrepancia prevalece el esquema para la forma y el validador para las reglas de la sección 3.

---

## 6. Revisiones y cambios

`revision` (entero) sube con cada cambio aprobado; `changelog[]` registra `{revision, date, change}`. `status` refleja la etapa: `planned → visual-in-production → visual-approved → voiceover-recorded → audio-integrated → final`.
