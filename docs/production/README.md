# Documentación de Producción: `docs/production/`

Este directorio aloja los estándares oficiales de producción audiovisual, la metodología de trabajo y la arquitectura temporal de **Socratech Motion Lab**.

## Estándares vigentes

- **[Metodología Visual-First (`VISUAL_FIRST.md`)](./VISUAL_FIRST.md)** — Flujo oficial de producción en 7 etapas (guion → planificación visual → producción visual sin audio → revisión visual → grabación de voiceover humano contra video aprobado → integración sonora y subtítulos finales → render final) y compuertas de aprobación (`G1`–`G5`).
- **[Planificación Temporal y Fuente Única de Verdad (`TIMING_PLAN.md`)](./TIMING_PLAN.md)** — Modelo de separación entre narrativa (`storyboard.md`) y tiempos (`timing.json`), contrato JSON Schema (`shared/contracts/timing.schema.json`), anclajes de `syncPoints`, validación local con `validate-timing.mjs` y estrategia propuesta de consumo en HyperFrames.

## Recursos relacionados

- **Decisión arquitectónica:** [ADR-0001 — Adopción de Visual-First](../architecture/ADR-0001-visual-first.md)
- **Contrato temporal ejecutable:** [timing.schema.json](../../shared/contracts/timing.schema.json)
- **Validador y resolutor temporal local:** [validate-timing.mjs](../../video-generation/scripts/validate-timing.mjs)
- **Plantillas reutilizables Visual-First:** [content/templates/](../../content/templates/README.md)
- **Identidad visual y motion (fuente de verdad):** [docs/brand/BRAND_TOKENS.md](../brand/BRAND_TOKENS.md) y [docs/brand/MOTION_RECOMMENDATIONS.md](../brand/MOTION_RECOMMENDATIONS.md)
