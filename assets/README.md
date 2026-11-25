# Biblioteca de Recursos Originales: `assets/`

Almacén maestro para materiales de origen, tipografías, recursos sonoros y referencias visuales.

> **Regla crítica de preservación:** Los archivos almacenados en `assets/` son **originales de referencia e insumos fuente**. Nunca deben editarse destructivamente ni sobrescribirse para adaptarlos a una composición puntual. Las versiones derivadas o procesadas para uso compartido van en `shared/brand/assets/` o `video-generation/public/`.

---

## Subdirectorios

| Carpeta | Contenido esperado | Origen actual conocido |
| :--- | :--- | :--- |
| `assets/brand-source/` | Originales oficiales e intactos de identidad visual: isotipo SVG del pensador, tarjetas comerciales (PDF/SVGs de Figma), QR oficial. | Inventariado en [docs/brand/BRAND_ASSETS.md](../docs/brand/BRAND_ASSETS.md). Pendiente copiar/centralizar aquí los binarios/SVG originales sin alterar `/home/mkayy/Documents/Projects/socratech/`. |
| `assets/fonts/` | Archivos tipográficos autorizados (`.woff2`, `.ttf`) de **Manrope** (pesos `400`, `500`, `600`, `700`, `800`) y la fuente monospace elegida para escenas de código. | Pendiente descarga/incorporación local para renderizado determinista offline. |
| `assets/audio-library/` | Pistas musicales, cortinas y efectos de sonido (SFX) reutilizables con documentación de licencia. | Vacío (Hito 0A). |
| `assets/references/` | Capturas de referencia (`socratech.com.ar` en mobile/desktop), mockups y ejemplos de estilo visual/motion. | Capturas mobile inventariadas en `docs/brand/BRAND_ASSETS.md`. |
