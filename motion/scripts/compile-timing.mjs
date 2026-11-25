#!/usr/bin/env node
/**
 * Compila content/videos/<id>/timing.json hacia un proyecto HyperFrames independiente:
 *  1. Valida timing.json contra el contrato Visual-First (reutilizando validate-timing.mjs).
 *  2. Genera generated/timing.resolved.js (window.__ST_TIMING) determinísticamente.
 *  3. Actualiza #root (data-duration, data-fps, data-width, data-height) y los hosts
 *     de escena (data-start, data-duration) en index.html sin perder atributos propios.
 *
 * Uso:
 *   node compile-timing.mjs <videoId|timingPath> [--project-dir <ruta>] [--check] [--set ID=seg]
 *
 * Local y offline: no usa red, sin timestamps volátiles.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateAndResolveTiming } from "./validate-timing.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const REPO_ROOT = resolve(__dirname, "..", "..");

function buildTimingResolvedJs(resolved) {
  const scenesById = {};
  for (const s of resolved.scenes) {
    const spMap = {};
    for (const sp of s.syncPoints) {
      spMap[sp.id] = { t: sp.t, tGlobal: sp.tGlobal, span: sp.span };
    }
    scenesById[s.id] = {
      id: s.id,
      order: s.order,
      system: s.system,
      mode: s.mode,
      start: s.start,
      duration: s.duration,
      end: s.end,
      transition: s.transition,
      holdStart: s.holdStart,
      syncPoints: spMap
    };
  }

  const payload = {
    schemaVersion: "1.0",
    videoId: resolved.videoId,
    revision: resolved.revision,
    status: resolved.status,
    format: resolved.format,
    fps: resolved.fps,
    total: resolved.total,
    scenes: scenesById
  };

  return [
    "/* ARCHIVO GENERADO AUTOMATICAMENTE POR video-generation/scripts/compile-timing.mjs */",
    "/* NO EDITAR MANUALMENTE — Editar content/videos/<id>/timing.json y recompilar. */",
    "(function initSocratechTiming(globalScope) {",
    '  "use strict";',
    `  globalScope.__ST_TIMING = ${JSON.stringify(payload, null, 2)};`,
    '})(typeof window !== "undefined" ? window : globalThis);',
    ""
  ].join("\n");
}

function replaceAttr(tagStr, attr, value) {
  const re = new RegExp(`(${attr}\\s*=\\s*)(["'])[^"']*\\2`);
  if (re.test(tagStr)) {
    return tagStr.replace(re, `$1"${value}"`);
  }
  return tagStr.replace(/>$/, ` ${attr}="${value}">`);
}

function updateIndexHtml(html, resolved) {
  let out = html;

  // 1. Actualizar atributos raíz en <div id="root" ...>
  out = out.replace(/<div\b[^>]*\bid=(["'])root\1[^>]*>/, (rootTag) => {
    let updated = replaceAttr(rootTag, "data-duration", resolved.total);
    updated = replaceAttr(updated, "data-fps", resolved.fps);
    updated = replaceAttr(updated, "data-width", resolved.format.width);
    updated = replaceAttr(updated, "data-height", resolved.format.height);
    return updated;
  });

  // 2. Actualizar hosts existentes por data-composition-id="<scene.id>"
  const missingHosts = [];
  for (const scene of resolved.scenes) {
    const hostRe = new RegExp(
      `<div\\b[^>]*\\bdata-composition-id=(["'])${scene.id}\\1[^>]*>`,
      "g"
    );
    let matched = false;
    out = out.replace(hostRe, (hostTag) => {
      matched = true;
      let updated = replaceAttr(hostTag, "data-start", scene.start);
      updated = replaceAttr(updated, "data-duration", scene.duration);
      updated = replaceAttr(updated, "data-width", resolved.format.width);
      updated = replaceAttr(updated, "data-height", resolved.format.height);
      return updated;
    });
    if (!matched) missingHosts.push(scene.id);
  }

  return { html: out, missingHosts };
}

/**
 * Compila o verifica timing.json sobre un proyecto HyperFrames.
 */
export function compileTiming({ timingPath, projectDir, checkOnly = false, setOverrides = {} }) {
  const absTiming = resolve(timingPath);
  const absProject = resolve(projectDir);

  if (!existsSync(absTiming)) {
    throw new Error(`No existe timing.json en ${absTiming}`);
  }
  if (!existsSync(absProject)) {
    throw new Error(`No existe el proyecto en ${absProject}`);
  }

  const doc = JSON.parse(readFileSync(absTiming, "utf8"));
  const { ok, errors, warnings, resolved } = validateAndResolveTiming(doc, setOverrides);
  if (!ok) {
    const msg = errors.map((e) => `  ✗ ${e}`).join("\n");
    throw new Error(`timing.json inválido:\n${msg}`);
  }

  const indexPath = join(absProject, "index.html");
  if (!existsSync(indexPath)) {
    throw new Error(`No existe index.html en ${absProject}`);
  }

  const expectedJs = buildTimingResolvedJs(resolved);
  const resolvedJsPath = join(absProject, "generated", "timing.resolved.js");
  const currentHtml = readFileSync(indexPath, "utf8");
  const { html: expectedHtml, missingHosts } = updateIndexHtml(currentHtml, resolved);

  if (missingHosts.length > 0) {
    throw new Error(
      `index.html en ${absProject} no declara hosts data-composition-id para: ${missingHosts.join(", ")}`
    );
  }

  if (checkOnly) {
    const drift = [];
    if (!existsSync(resolvedJsPath) || readFileSync(resolvedJsPath, "utf8") !== expectedJs) {
      drift.push("generated/timing.resolved.js no coincide con timing.json");
    }
    if (currentHtml !== expectedHtml) {
      drift.push("index.html tiene atributos temporales desactualizados respecto a timing.json");
    }
    return { ok: drift.length === 0, warnings, resolved, errors: drift };
  }

  mkdirSync(dirname(resolvedJsPath), { recursive: true });
  let changed = false;
  if (!existsSync(resolvedJsPath) || readFileSync(resolvedJsPath, "utf8") !== expectedJs) {
    writeFileSync(resolvedJsPath, expectedJs, "utf8");
    changed = true;
  }
  if (currentHtml !== expectedHtml) {
    writeFileSync(indexPath, expectedHtml, "utf8");
    changed = true;
  }

  return { ok: true, warnings, resolved, changed, errors: [] };
}

function runCli() {
  const argv = process.argv.slice(2);
  let target = null;
  let projectDir = null;
  let checkOnly = false;
  const setOverrides = {};

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--project-dir") projectDir = argv[++i];
    else if (a === "--check") checkOnly = true;
    else if (a === "--set") {
      const [id, v] = String(argv[++i] ?? "").split("=");
      setOverrides[id] = Number(v);
    } else if (a === "--help" || a === "-h") {
      console.log("Uso: compile-timing.mjs <videoId|timingPath> [--project-dir <ruta>] [--check] [--set ID=seg]");
      process.exit(0);
    } else if (!a.startsWith("--")) {
      target = a;
    }
  }

  if (!target) {
    console.error("ERROR: especificá <videoId> o ruta a timing.json.");
    process.exit(2);
  }

  const isPath = target.endsWith(".json") || target.includes("/") || target.includes("\\");
  const timingPath = isPath
    ? resolve(target)
    : join(REPO_ROOT, "content", "videos", target, "timing.json");

  const doc = JSON.parse(readFileSync(timingPath, "utf8"));
  const resolvedProjectDir = projectDir
    ? resolve(projectDir)
    : join(REPO_ROOT, "video-generation", "projects", doc.videoId);

  try {
    const res = compileTiming({ timingPath, projectDir: resolvedProjectDir, checkOnly, setOverrides });
    if (res.warnings.length) res.warnings.forEach((w) => console.error(`  ⚠ ${w}`));
    if (!res.ok) {
      console.error(`[compile-timing] DRIFT en '${res.resolved.videoId}':`);
      res.errors.forEach((e) => console.error(`  ✗ ${e}`));
      process.exit(1);
    }
    const modeLabel = checkOnly ? "VERIFICADO" : res.changed ? "COMPILADO" : "SIN CAMBIOS";
    console.log(
      `[compile-timing] ${modeLabel} (${res.resolved.videoId} rev ${res.resolved.revision}) · ${res.resolved.scenes.length} escenas · ${res.resolved.total} s`
    );
  } catch (err) {
    console.error(`[compile-timing] ERROR: ${err.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
