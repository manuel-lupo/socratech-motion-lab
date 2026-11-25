#!/usr/bin/env node
/**
 * Sincroniza de manera reproducible y determinista tokens, fuentes, isotipos derivados
 * y componentes institucionales desde las fuentes canónicas (shared/brand/, assets/fonts/,
 * video-generation/shared/) hacia proyectos independientes en video-generation/projects/<id>/.
 *
 * Uso:
 *   node sync-brand-assets.mjs --project <id> [--check]
 *   node sync-brand-assets.mjs --project-dir <ruta> [--check]
 *   node sync-brand-assets.mjs --all [--check]
 *
 * Local y offline: no usa red, no altera video-generation/project/ ni assets/brand-source/.
 */

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const REPO_ROOT = resolve(__dirname, "..", "..");

const BRAND_SOURCE_LOGO = join(REPO_ROOT, "assets", "brand-source", "logo.svg");
const SHARED_ASSETS_DIR = join(REPO_ROOT, "shared", "brand", "assets");
const SHARED_TOKENS_DIR = join(REPO_ROOT, "shared", "brand", "tokens");
const FONTS_SRC_DIR = join(REPO_ROOT, "assets", "fonts");
const VG_SHARED_DIR = join(REPO_ROOT, "video-generation", "shared");
const PROJECTS_ROOT = join(REPO_ROOT, "video-generation", "projects");

function sha256Buffer(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function writeIfChanged(filePath, contentBuffer) {
  mkdirSync(dirname(filePath), { recursive: true });
  if (existsSync(filePath)) {
    const existing = readFileSync(filePath);
    if (existing.equals(contentBuffer)) return false;
  }
  writeFileSync(filePath, contentBuffer);
  return true;
}

/**
 * Genera (sin reescribir si ya coinciden) los 3 SVG derivados en shared/brand/assets/.
 */
export function verifyOrBuildDerivedIsotypes({ checkOnly = false } = {}) {
  if (!existsSync(BRAND_SOURCE_LOGO)) {
    throw new Error(`No se encontró el isotipo original en ${BRAND_SOURCE_LOGO}`);
  }
  const originalSvg = readFileSync(BRAND_SOURCE_LOGO, "utf8");
  if (!originalSvg.includes('viewBox="0 0 580 590"') || !originalSvg.includes('fill="#071F64"')) {
    throw new Error("El archivo logo.svg no coincide con la estructura esperada de fuente de verdad.");
  }

  const variants = [
    {
      filename: "thinker-mark-dark-bg.svg",
      fill: "#FBFBF4",
      label: "Isotipo SOCRATECH, pensador en marfil para fondo oscuro"
    },
    {
      filename: "thinker-mark-light-bg.svg",
      fill: "#101A39",
      label: "Isotipo SOCRATECH, pensador en navy para fondo claro"
    },
    {
      filename: "thinker-mark-lime-watermark.svg",
      fill: "#CEEF62",
      label: "Marca de agua isotipo SOCRATECH en lima eléctrico"
    }
  ];

  for (const variant of variants) {
    const derived = `${originalSvg
      .replace('fill="#071F64"', `fill="${variant.fill}"`)
      .replace(/aria-label="[^"]*"/, `aria-label="${variant.label}"`)
      .trim()}\n`;
    const targetPath = join(SHARED_ASSETS_DIR, variant.filename);
    if (checkOnly) {
      if (!existsSync(targetPath) || readFileSync(targetPath, "utf8") !== derived) {
        throw new Error(`Drift detectado en derivado SVG compartido: ${relative(REPO_ROOT, targetPath)}`);
      }
    } else {
      writeIfChanged(targetPath, Buffer.from(derived, "utf8"));
    }
  }
}

/**
 * Construye el mapa determinista de archivos a sincronizar hacia un proyecto destino.
 * @returns {Array<{ relDest: string, sourceLabel: string, buffer: Buffer }>}
 */
function collectCanonicalArtifacts() {
  const items = [];

  const tokensCssSrc = join(SHARED_TOKENS_DIR, "tokens.css");
  const tokensJsonSrc = join(SHARED_TOKENS_DIR, "brand-tokens.json");
  if (!existsSync(tokensCssSrc) || !existsSync(tokensJsonSrc)) {
    throw new Error(`Faltan tokens en ${SHARED_TOKENS_DIR}`);
  }

  const cssHeader = [
    "/* ARCHIVO SINCRONIZADO AUTOMATICAMENTE POR video-generation/scripts/sync-brand-assets.mjs */",
    "/* NO EDITAR MANUALMENTE AQUI — Editar en fuente canónica y volver a sincronizar. */",
    ""
  ].join("\n");

  const jsHeader = [
    "/* ARCHIVO SINCRONIZADO AUTOMATICAMENTE POR video-generation/scripts/sync-brand-assets.mjs */",
    "/* NO EDITAR MANUALMENTE AQUI — Editar en video-generation/shared/ y volver a sincronizar. */",
    ""
  ].join("\n");

  items.push({
    relDest: "styles/tokens.css",
    sourceLabel: "shared/brand/tokens/tokens.css",
    buffer: Buffer.from(`${cssHeader}${readFileSync(tokensCssSrc, "utf8")}`, "utf8")
  });

  items.push({
    relDest: "assets/brand/brand-tokens.json",
    sourceLabel: "shared/brand/tokens/brand-tokens.json",
    buffer: readFileSync(tokensJsonSrc)
  });

  for (const svg of ["thinker-mark-dark-bg.svg", "thinker-mark-light-bg.svg", "thinker-mark-lime-watermark.svg"]) {
    const p = join(SHARED_ASSETS_DIR, svg);
    if (!existsSync(p)) throw new Error(`Falta derivado SVG en ${p}`);
    items.push({
      relDest: `assets/brand/${svg}`,
      sourceLabel: `shared/brand/assets/${svg}`,
      buffer: readFileSync(p)
    });
  }

  for (const font of ["Inter-400.woff2", "Inter-700.woff2", "JetBrainsMono-400.woff2", "JetBrainsMono-700.woff2"]) {
    const p = join(FONTS_SRC_DIR, font);
    if (!existsSync(p)) throw new Error(`Falta fuente local en ${p}`);
    items.push({
      relDest: `assets/fonts/${font}`,
      sourceLabel: `assets/fonts/${font}`,
      buffer: readFileSync(p)
    });
  }

  const brandSystemCss = join(VG_SHARED_DIR, "styles", "brand-system.css");
  if (!existsSync(brandSystemCss)) throw new Error(`Falta ${brandSystemCss}`);
  items.push({
    relDest: "styles/brand-system.css",
    sourceLabel: "video-generation/shared/styles/brand-system.css",
    buffer: Buffer.from(`${cssHeader}${readFileSync(brandSystemCss, "utf8")}`, "utf8")
  });

  const compLibJs = join(VG_SHARED_DIR, "components", "components-library.js");
  if (!existsSync(compLibJs)) throw new Error(`Falta ${compLibJs}`);
  items.push({
    relDest: "components/components-library.js",
    sourceLabel: "video-generation/shared/components/components-library.js",
    buffer: Buffer.from(`${jsHeader}${readFileSync(compLibJs, "utf8")}`, "utf8")
  });

  const gsapDir = join(VG_SHARED_DIR, "vendor", "gsap");
  for (const gsapFile of ["gsap.min.js", "CustomEase.min.js", "MotionPathPlugin.min.js"]) {
    const p = join(gsapDir, gsapFile);
    if (!existsSync(p)) throw new Error(`Falta runtime GSAP en ${p}`);
    items.push({
      relDest: `vendor/gsap/${gsapFile}`,
      sourceLabel: `video-generation/shared/vendor/gsap/${gsapFile}`,
      buffer: readFileSync(p)
    });
  }

  return items.sort((a, b) => a.relDest.localeCompare(b.relDest));
}

/**
 * Sincroniza o verifica un proyecto HyperFrames destino.
 * @param {string} projectDir
 * @param {{ checkOnly?: boolean, projectId?: string }} options
 */
export function syncProject(projectDir, { checkOnly = false, projectId } = {}) {
  const absDir = resolve(projectDir);
  if (!existsSync(absDir)) {
    throw new Error(`El directorio del proyecto no existe: ${absDir}`);
  }
  let metaVideoId = null;
  const metaPath = join(absDir, "project.meta.json");
  if (existsSync(metaPath)) {
    try {
      metaVideoId = JSON.parse(readFileSync(metaPath, "utf8"))?.videoId || null;
    } catch {
      metaVideoId = null;
    }
  }
  const id = projectId || metaVideoId || basename(absDir);
  verifyOrBuildDerivedIsotypes({ checkOnly });
  const items = collectCanonicalArtifacts();

  const expectedManifestFiles = {};
  for (const item of items) {
    expectedManifestFiles[item.relDest] = {
      source: item.sourceLabel,
      sha256: sha256Buffer(item.buffer)
    };
  }
  const expectedManifest = {
    schemaVersion: "1.0",
    projectId: id,
    files: expectedManifestFiles
  };
  const expectedManifestStr = `${JSON.stringify(expectedManifest, null, 2)}\n`;
  const manifestPath = join(absDir, "generated", "sync-manifest.json");

  if (checkOnly) {
    const driftErrors = [];
    if (!existsSync(manifestPath)) {
      driftErrors.push(`Falta generated/sync-manifest.json en ${id}`);
    } else {
      const actualManifestStr = readFileSync(manifestPath, "utf8");
      if (actualManifestStr !== expectedManifestStr) {
        driftErrors.push(`generated/sync-manifest.json desactualizado respecto a fuentes canónicas en ${id}`);
      }
    }
    for (const item of items) {
      const destPath = join(absDir, item.relDest);
      if (!existsSync(destPath)) {
        driftErrors.push(`Falta archivo sincronizado: ${item.relDest}`);
        continue;
      }
      const actualHash = sha256Buffer(readFileSync(destPath));
      const expectedHash = expectedManifestFiles[item.relDest].sha256;
      if (actualHash !== expectedHash) {
        driftErrors.push(`Drift detectado en ${item.relDest} (hash en disco != fuente canónica)`);
      }
    }
    return { ok: driftErrors.length === 0, projectId: id, fileCount: items.length, errors: driftErrors };
  }

  let updated = 0;
  for (const item of items) {
    if (writeIfChanged(join(absDir, item.relDest), item.buffer)) updated++;
  }
  if (writeIfChanged(manifestPath, Buffer.from(expectedManifestStr, "utf8"))) updated++;

  return { ok: true, projectId: id, fileCount: items.length, updated, errors: [] };
}

function discoverProjectDirs() {
  if (!existsSync(PROJECTS_ROOT)) return [];
  return readdirSync(PROJECTS_ROOT)
    .map((name) => join(PROJECTS_ROOT, name))
    .filter((p) => statSync(p).isDirectory() && (existsSync(join(p, "hyperframes.json")) || existsSync(join(p, "project.meta.json"))));
}

function runCli() {
  const argv = process.argv.slice(2);
  let projectId = null;
  let projectDir = null;
  let all = false;
  let checkOnly = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--project") projectId = argv[++i];
    else if (a === "--project-dir") projectDir = argv[++i];
    else if (a === "--all") all = true;
    else if (a === "--check") checkOnly = true;
    else if (a === "--help" || a === "-h") {
      console.log("Uso: sync-brand-assets.mjs (--project <id> | --project-dir <ruta> | --all) [--check]");
      process.exit(0);
    }
  }

  const targets = [];
  if (projectDir) targets.push({ dir: resolve(projectDir), id: projectId || undefined });
  else if (projectId) targets.push({ dir: join(PROJECTS_ROOT, projectId), id: projectId });
  else if (all) {
    for (const d of discoverProjectDirs()) targets.push({ dir: d, id: basename(d) });
  } else {
    console.error("ERROR: especificá --project <id>, --project-dir <ruta> o --all.");
    process.exit(2);
  }

  if (targets.length === 0) {
    console.log("[sync-brand-assets] No hay proyectos en video-generation/projects/ para sincronizar.");
    process.exit(0);
  }

  let hasFailures = false;
  for (const t of targets) {
    const res = syncProject(t.dir, { checkOnly, projectId: t.id });
    if (!res.ok) {
      hasFailures = true;
      console.error(`[sync-brand-assets] DRIFT en '${res.projectId}':`);
      for (const e of res.errors) console.error(`  ✗ ${e}`);
    } else if (checkOnly) {
      console.log(`[sync-brand-assets] OK (${res.projectId}) · ${res.fileCount} archivos verificados sin drift.`);
    } else {
      console.log(`[sync-brand-assets] OK (${res.projectId}) · ${res.fileCount} archivos sincronizados (${res.updated} escritos).`);
    }
  }

  if (hasFailures) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
