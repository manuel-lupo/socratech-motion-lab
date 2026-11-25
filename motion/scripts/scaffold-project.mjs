#!/usr/bin/env node
/**
 * Crea un proyecto HyperFrames independiente a partir de video-generation/shared/project-template/
 * y un archivo timing.json válido (Visual-First), sincronizando activos de marca y compilando tiempos.
 *
 * Uso:
 *   node scaffold-project.mjs <videoId> [--timing <ruta>] [--project-dir <ruta>] [--force]
 *
 * Local y offline: no usa red, no modifica video-generation/project/.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateAndResolveTiming } from "./validate-timing.mjs";
import { syncProject } from "./sync-brand-assets.mjs";
import { compileTiming } from "./compile-timing.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
export const REPO_ROOT = resolve(__dirname, "..", "..");
const TEMPLATE_DIR = join(REPO_ROOT, "video-generation", "shared", "project-template");

function inferResolution(width, height) {
  if (width === height) return "square";
  return height > width ? "portrait" : "landscape";
}

function renderTemplate(str, vars) {
  let out = str;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, String(v));
  }
  return out;
}

export function scaffoldProject({ videoId, timingPath, projectDir, force = false }) {
  const absTiming = resolve(timingPath);
  const absProject = resolve(projectDir);

  if (!existsSync(absTiming)) {
    throw new Error(`No se encontró timing.json en ${absTiming}`);
  }
  if (existsSync(absProject) && !force) {
    throw new Error(`El proyecto destino ya existe: ${absProject} (usar --force para sobrescribir archivos base)`);
  }

  const doc = JSON.parse(readFileSync(absTiming, "utf8"));
  const { ok, errors, resolved } = validateAndResolveTiming(doc);
  if (!ok) {
    throw new Error(`timing.json inválido:\n${errors.map((e) => `  ✗ ${e}`).join("\n")}`);
  }

  const id = videoId || resolved.videoId;
  const resolution = inferResolution(resolved.format.width, resolved.format.height);

  mkdirSync(join(absProject, "compositions"), { recursive: true });
  mkdirSync(join(absProject, "styles"), { recursive: true });
  mkdirSync(join(absProject, "generated"), { recursive: true });

  // 1. hyperframes.json
  writeFileSync(
    join(absProject, "hyperframes.json"),
    readFileSync(join(TEMPLATE_DIR, "hyperframes.json"), "utf8"),
    "utf8"
  );

  // 2. package.json
  writeFileSync(
    join(absProject, "package.json"),
    renderTemplate(readFileSync(join(TEMPLATE_DIR, "package.json"), "utf8"), { VIDEO_ID: id }),
    "utf8"
  );

  // 3. project.meta.json
  writeFileSync(
    join(absProject, "project.meta.json"),
    renderTemplate(readFileSync(join(TEMPLATE_DIR, "project.meta.json.template"), "utf8"), { VIDEO_ID: id }),
    "utf8"
  );

  // 4. Escenas iniciales en compositions/<scene.id>.html
  const sceneTpl = readFileSync(join(TEMPLATE_DIR, "scene.template.html"), "utf8");
  const rawScenesById = Object.fromEntries(doc.scenes.map((s) => [s.id, s]));

  const scenesHtml = resolved.scenes
    .map((s) => {
      const raw = rawScenesById[s.id];
      const sceneFile = `compositions/${s.id}.html`;
      const absSceneFile = join(absProject, sceneFile);
      if (!existsSync(absSceneFile) || force) {
        const metaDur = Math.max(0.1, Math.round((s.duration - 0.2) * 1000) / 1000);
        const sceneContent = renderTemplate(sceneTpl, {
          SCENE_ID: s.id,
          SCENE_SYSTEM: s.system,
          SCENE_DURATION: s.duration,
          SCENE_META_DURATION: metaDur,
          NARRATIVE_FUNCTION: raw?.narrativeFunction ?? s.id,
          WIDTH: resolved.format.width,
          HEIGHT: resolved.format.height
        });
        writeFileSync(absSceneFile, sceneContent, "utf8");
      }

      return [
        `      <div`,
        `        id="${s.id}"`,
        `        data-composition-id="${s.id}"`,
        `        data-composition-src="${sceneFile}"`,
        `        data-start="${s.start}"`,
        `        data-duration="${s.duration}"`,
        `        data-track-index="0"`,
        `        data-track-kind="graphics"`,
        `        data-width="${resolved.format.width}"`,
        `        data-height="${resolved.format.height}"`,
        `      ></div>`
      ].join("\n");
    })
    .join("\n");

  // 5. index.html
  const indexTpl = readFileSync(join(TEMPLATE_DIR, "index.template.html"), "utf8");
  const indexHtml = renderTemplate(indexTpl, {
    VIDEO_ID: id,
    RESOLUTION: resolution,
    WIDTH: resolved.format.width,
    HEIGHT: resolved.format.height,
    FPS: resolved.fps,
    TOTAL_DURATION: resolved.total,
    SCENES_HTML: scenesHtml
  });
  writeFileSync(join(absProject, "index.html"), indexHtml, "utf8");

  // 6. Sincronizar Brand System y compilar timing.resolved.js
  const syncRes = syncProject(absProject, { projectId: id });
  const compileRes = compileTiming({ timingPath: absTiming, projectDir: absProject });

  return { projectId: id, projectDir: absProject, syncRes, compileRes };
}

function runCli() {
  const argv = process.argv.slice(2);
  let videoId = null;
  let timingPath = null;
  let projectDir = null;
  let force = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--timing") timingPath = argv[++i];
    else if (a === "--project-dir") projectDir = argv[++i];
    else if (a === "--force") force = true;
    else if (a === "--help" || a === "-h") {
      console.log("Uso: scaffold-project.mjs <videoId> [--timing <ruta>] [--project-dir <ruta>] [--force]");
      process.exit(0);
    } else if (!a.startsWith("--")) {
      videoId = a;
    }
  }

  if (!videoId && !timingPath) {
    console.error("ERROR: especificá <videoId> (o --timing <ruta>).");
    process.exit(2);
  }

  const resolvedTiming = timingPath
    ? resolve(timingPath)
    : join(REPO_ROOT, "content", "videos", videoId, "timing.json");
  const resolvedProjectDir = projectDir
    ? resolve(projectDir)
    : join(REPO_ROOT, "video-generation", "projects", videoId);

  try {
    const res = scaffoldProject({
      videoId,
      timingPath: resolvedTiming,
      projectDir: resolvedProjectDir,
      force
    });
    console.log(
      `[scaffold-project] OK — Proyecto '${res.projectId}' creado en ${res.projectDir} (${res.compileRes.resolved.scenes.length} escenas, ${res.syncRes.fileCount} activos sincronizados).`
    );
  } catch (err) {
    console.error(`[scaffold-project] ERROR: ${err.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
