# Integración G4 → G5 — Audio, Subtítulos y Hold Final (`G4_G5_INTEGRATION.md`)

Documentación del flujo reproducible para pasar de un video visual aprobado (`Gate G3`) y una grabación humana (`Gate G4`) al render final (`Gate G5`) en **Socratech Motion Lab**.

---

## 1. Principios del pipeline G4 → G5

1. **Inmutabilidad de `timing.json`:** Los tiempos de escenas aprobados en `content/videos/<id>/timing.json` **no** se editan para absorber excedentes de locución.
2. **Extensión explícita del hold final:** Si `voiceover.wav` excede la duración visual base, [integrate-g5.mjs](../../video-generation/scripts/integrate-g5.mjs) extiende automáticamente el `data-duration` de `#root` y del último host de escena en `index.html`, aprovechando el comportamiento nativo de HyperFrames (sostener el último frame sin cortar ni acelerar la voz).
3. **Mezcla independiente y reproducible:** `voiceover.wav` y `background-music.mp3` (opcional) se mezclan localmente con `ffmpeg` (`48 kHz`, PCM 16-bit) aplicando volumen configurable, fades y *sidechain ducking* automático, sin alterar la velocidad de reproducción.
4. **Subtítulos sincronizados al audio real:** `content/videos/<id>/audio/captions.json` se compila en `compositions/captions.html` (`data-track-kind="captions"`) dentro de la banda segura `y ∈ [1124, 1236] px`.

---

## 2. Entradas esperadas en `content/videos/<NNN-slug>/audio/`

| Archivo | Requerido | Descripción |
| :--- | :--- | :--- |
| `voiceover.wav` | Sí | Locución humana seleccionada (preferente `48 kHz` mono PCM). |
| `background-music.mp3` | No | Pista instrumental opcional; su procedencia y licencia comercial **deben** quedar verificadas en `take-log.md`. |
| `captions.json` | No | Arreglo `cues[]` (`{ id, start, end, text }`) alineado a la grabación real y al guion aprobado. |
| `take-log.md` | Sí | Registro de tomas, duraciones medidas y estado de licencia musical. |

---

## 3. Ejecución paso a paso para cualquier video `<id>`

```bash
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 HYPERFRAMES_SKIP_SKILLS=1 HYPERFRAMES_NO_UPDATE_CHECK=1
source "$HOME/.nvm/nvm.sh" && nvm use 24.22.3 --silent

# 1. Integrar audio (ducking -18 dB por defecto), subtítulos y extensión de hold final
node video-generation/scripts/integrate-g5.mjs <id> --music-db -18 --tail 0.25

# 2. Verificar integridad del manifiesto G5
node video-generation/scripts/integrate-g5.mjs <id> --check

# 3. Validar con HyperFrames (layout, contraste, audio, motion, craft y zona de subtítulos)
node .agents/skills/hyperframes/scripts/plugin-cli.mjs --cli-version 0.9.91 check video-generation/projects/<id> \
  --caption-zone "x0=0.11;y0=.58;x1=.72;y1=.65;severity=error;seek=.1,.35,.6,.85" --json

# 4. Render final determinista en renders/final/
node .agents/skills/hyperframes/scripts/plugin-cli.mjs --cli-version 0.9.91 render \
  video-generation/projects/<id> --quality delivery --fps 30 \
  --output video-generation/renders/final/<id>-final-v1.mp4
```

### Parámetros configurables de `integrate-g5.mjs`
- `--music-db <dB>`: Ganancia base de la música de fondo antes del ducking (default: `-18`).
- `--tail <seg>`: Margen de respiración tras finalizar `voiceover.wav` (default: `0.25`).
- `--fade-in <seg>` / `--fade-out <seg>`: Fades de entrada y salida de la música (defaults: `0.8` / `1.6`).
- `--check`: Verifica que `generated/g5-manifest.json` coincida con `timing.json` y los audios actuales.
