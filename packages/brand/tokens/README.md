# Tokens Compartidos de Marca (`shared/brand/tokens/`)

Este directorio centraliza la implementación técnica reutilizable del sistema de identidad visual de **Socratech** para todos los subsistemas de **Socratech Motion Lab**.

## 1. Fuente única de verdad

- **Fuente documental oficial:** [docs/brand/BRAND_TOKENS.md](../../../docs/brand/BRAND_TOKENS.md) y [docs/brand/BRAND_AUDIT.md](../../../docs/brand/BRAND_AUDIT.md).
- **Directriz cromática vigente:** La paleta de las tarjetas comerciales (`#101A39`, `#121D42`, `#10204D`, `#FBFBF4`, `#CEEF62`, `#949EB9`, `#56607B`, `#FFFFFF`) constituye la paleta oficial por defecto. La paleta original de la web (`#071F64`, `#218487`, `#F4F5F0`) se conserva únicamente bajo el selector alternativo `[data-brand-theme="web-legacy"]`.

## 2. Estructura de archivos

| Archivo | Formato | Propósito |
| :--- | :--- | :--- |
| [brand-tokens.json](./brand-tokens.json) | JSON estructurado | Especificación programática de paletas (`cardsOfficial` y `webLegacy`), opacidades (`0.08–0.18` orbitales, `0.075` watermark), tipografías, jerarquías 9:16, proporciones del lockup provisional, safe zones y curvas de movimiento. |
| [tokens.css](./tokens.css) | CSS Custom Properties | Hojas de variables `--st-*` en `:root` (tema oficial por defecto), tema alternativo `[data-brand-theme="web-legacy"]` y declaraciones `@font-face` locales 100 % offline. |
| [README.md](./README.md) | Markdown | Documentación de consumo, sincronización y mantenimiento. |

## 3. Mecanismo de consumo y sincronización

Las composiciones de **HyperFrames** en [video-generation/project/](../../../video-generation/project/) **no duplican ni editan tokens manualmente**. El script reproducible [video-generation/scripts/sync-brand-assets.mjs](../../../video-generation/scripts/sync-brand-assets.mjs) toma la fuente compartida y sincroniza:

1. `shared/brand/tokens/tokens.css` → `video-generation/project/styles/tokens.css` (con encabezado de advertencia de solo lectura).
2. `shared/brand/tokens/brand-tokens.json` → `video-generation/project/assets/brand/brand-tokens.json`.
3. `assets/brand-source/logo.svg` → variantes cromáticas derivadas en `shared/brand/assets/` (`thinker-mark-dark-bg.svg`, `thinker-mark-light-bg.svg`, `thinker-mark-lime-watermark.svg`) preservando intacta la geometría `<path d="..." fill-rule="evenodd">` y `viewBox="0 0 580 590"`, copiadas a `video-generation/project/assets/brand/`.
4. `assets/fonts/*.woff2` → `video-generation/project/assets/fonts/`.

## 4. Procedimiento de actualización

1. Verificar primero cualquier cambio de diseño en `docs/brand/BRAND_TOKENS.md`.
2. Actualizar los valores en [brand-tokens.json](./brand-tokens.json) y [tokens.css](./tokens.css) manteniendo paridad entre ambos.
3. Ejecutar desde la raíz del repositorio o desde `video-generation/`:
   ```bash
   node video-generation/scripts/sync-brand-assets.mjs
   ```
4. Ejecutar `lint` y `check` sobre `video-generation/project/` para validar contraste WCAG AA y cumplimiento tipográfico sin tráfico de red externo.

## 5. Estado tipográfico pendiente (`Manrope`)

- **[PENDIENTE]:** El proyecto web original usa **Manrope** cargada desde Google Fonts (`next/font/google`), mientras que en [assets/fonts/](../../../assets/fonts/) aún no se han incorporado los archivos `.woff2` estáticos de `Manrope` (`400`, `500`, `600`, `700`, `800`).
- Para cumplir estrictamente la política de cero tráfico de red durante el Hito 0B, `tokens.css` enlaza localmente los binarios `.woff2` disponibles sin red (`Inter-400.woff2` / `Inter-700.woff2`, tipografía inferida de las tarjetas comerciales, junto con `JetBrainsMono-400.woff2` / `JetBrainsMono-700.woff2`). Al incorporar los archivos `.woff2` oficiales de `Manrope` en `assets/fonts/`, bastará actualizar las rutas `@font-face` en `shared/brand/tokens/tokens.css` y volver a correr `sync-brand-assets.mjs`.
