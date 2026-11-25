# ADR-0001 — Visual-First reemplaza a Audio-First

- **Estado:** Aceptada (decisión confirmada por el equipo de Socratech)
- **Contexto:** El flujo previo exigía la grabación de voz antes de producir imagen, de modo que el ritmo visual derivaba de la duración del WAV. Eso bloqueaba la producción visual, la revisión y la reutilización.
- **Decisión:** Visual-First es el estándar de todos los videos. Guion → storyboard + timing plan → video visual → revisión → voz humana sobre el video aprobado → audio y subtítulos → render final. Ver [VISUAL_FIRST.md](../production/VISUAL_FIRST.md).
- **Consecuencias:**
  - El audio es una etapa posterior; su ausencia es un estado válido.
  - Se introduce `timing.json` como única fuente temporal ([TIMING_PLAN.md](../production/TIMING_PLAN.md)).
  - La voz puede requerir ajustes razonables del video; no se fuerza la locución.
  - La voz sintética queda como posibilidad futura, no implementada.
- **Sin cambios:** Brand System del Hito 0B (`shared/brand/`, `video-generation/project/`), guiones aprobados.
