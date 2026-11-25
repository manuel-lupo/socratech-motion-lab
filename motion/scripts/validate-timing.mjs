#!/usr/bin/env node
/**
 * Valida y resuelve un timing plan (Visual-First). Sin dependencias.
 * Uso: node validate-timing.mjs <timing.json> [--table] [--json] [--set ID=segundos ...]
 * Contrato: shared/contracts/timing.schema.json · Reglas: docs/production/TIMING_PLAN.md
 * Local y offline: no usa red ni escribe archivos.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const STATUS = ["planned", "visual-in-production", "visual-approved", "voiceover-recorded", "audio-integrated", "final"];
const SYSTEMS = ["A", "B", "A>B"];
const TRANS = ["none", "cut", "match-cut", "zoom-out", "transform", "pager-cover", "fade"];
const ANCHORS = ["start", "end", "ratio"];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round = (n) => Math.round(n * 1000) / 1000;

function atTime(at, dur) {
  return at.anchor === "start" ? at.value : at.anchor === "end" ? dur - at.value : at.value * dur;
}

/**
 * Valida un documento timing.json y resuelve los tiempos absolutos de cada escena.
 * @param {object} doc
 * @param {Record<string, number>} setOverrides
 * @returns {{ ok: boolean, errors: string[], warnings: string[], resolved: object | null }}
 */
export function validateAndResolveTiming(doc, setOverrides = {}) {
  const errors = [];
  const warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);

  if (!doc || typeof doc !== "object") {
    err("El documento timing.json debe ser un objeto JSON.");
    return { ok: false, errors, warnings, resolved: null };
  }

  for (const k of ["schemaVersion", "videoId", "revision", "status", "format", "totalDuration", "scenes"]) {
    if (!(k in doc)) err(`falta el campo obligatorio '${k}'`);
  }
  if (errors.length) return { ok: false, errors, warnings, resolved: null };

  if (doc.schemaVersion !== "1.0") err(`schemaVersion debe ser "1.0"`);
  if (!/^[0-9]{3}-[a-z0-9-]+$/.test(doc.videoId ?? "")) err(`videoId inválido (NNN-slug)`);
  if (!Number.isInteger(doc.revision) || doc.revision < 1) err(`revision debe ser entero >= 1`);
  if (!STATUS.includes(doc.status)) err(`status inválido: ${doc.status}`);

  const f = doc.format ?? {};
  for (const k of ["width", "height", "fps"]) {
    if (!Number.isInteger(f[k]) || f[k] < 1) err(`format.${k} debe ser entero >= 1`);
  }

  const td = doc.totalDuration ?? {};
  for (const k of ["target", "min", "max"]) {
    if (!isNum(td[k]) || td[k] <= 0) err(`totalDuration.${k} debe ser > 0`);
  }
  if (isNum(td.min) && isNum(td.target) && isNum(td.max) && !(td.min <= td.target && td.target <= td.max)) {
    err(`totalDuration: debe cumplirse min <= target <= max`);
  }

  if (!Array.isArray(doc.scenes) || doc.scenes.length === 0) err(`scenes debe ser un arreglo no vacío`);
  if (errors.length) return { ok: false, errors, warnings, resolved: null };

  const scenes = doc.scenes;
  const ids = new Set();
  const syncIds = new Set();

  scenes.forEach((s, idx) => {
    const p = `scenes[${idx}]${s?.id ? ` (${s.id})` : ""}`;
    if (typeof s.id !== "string" || !/^[A-Za-z0-9_-]+$/.test(s.id)) return err(`${p}: id inválido`);
    if (ids.has(s.id)) err(`${p}: id duplicado`);
    ids.add(s.id);
    if (s.order !== idx + 1) err(`${p}: order debe ser ${idx + 1} (contiguo y ordenado)`);
    if (!SYSTEMS.includes(s.system)) err(`${p}: system debe ser ${SYSTEMS.join("|")}`);
    if (typeof s.narrativeFunction !== "string" || !s.narrativeFunction) err(`${p}: falta narrativeFunction`);

    const d = s.duration;
    if (!d || !["fixed", "flexible"].includes(d.mode)) return err(`${p}: duration.mode debe ser fixed|flexible`);
    for (const k of ["target", "min", "max"]) {
      if (!isNum(d[k]) || d[k] <= 0) err(`${p}: duration.${k} debe ser > 0`);
    }
    if (isNum(d.min) && isNum(d.target) && isNum(d.max)) {
      if (!(d.min <= d.target && d.target <= d.max)) err(`${p}: debe cumplirse min <= target <= max`);
      if (d.mode === "fixed" && !(d.min === d.target && d.target === d.max)) err(`${p}: mode 'fixed' exige min = target = max`);
    }

    const tr = s.transitionOut;
    if (tr) {
      if (!TRANS.includes(tr.type)) err(`${p}: transitionOut.type inválido`);
      if (!isNum(tr.duration) || tr.duration < 0) err(`${p}: transitionOut.duration inválida`);
      else if (isNum(d.min) && tr.duration >= d.min) {
        err(`${p}: transitionOut.duration (${tr.duration}) debe ser menor que duration.min (${d.min})`);
      }
    }

    const trDur = tr && isNum(tr.duration) ? tr.duration : 0;
    const rm = s.readingMoments ?? [];
    const reading = rm.reduce((a, r) => a + (isNum(r.minHold) ? r.minHold : 0), 0);
    if (isNum(d.min) && reading + trDur > d.min + 1e-9) {
      err(`${p}: Σ readingMoments (${round(reading)}) + transición (${trDur}) excede duration.min (${d.min})`);
    }

    const hold = s.constraints?.minHoldSeconds;
    if (hold !== undefined && isNum(d.min) && hold + trDur > d.min + 1e-9) {
      err(`${p}: minHoldSeconds (${hold}) + transición (${trDur}) excede duration.min (${d.min})`);
    }

    for (const sp of s.syncPoints ?? []) {
      const q = `${p}.syncPoint '${sp.id}'`;
      if (syncIds.has(sp.id)) err(`${q}: id duplicado`);
      syncIds.add(sp.id);
      if (!sp.at || !ANCHORS.includes(sp.at.anchor) || !isNum(sp.at.value) || sp.at.value < 0) {
        err(`${q}: 'at' inválido`);
        continue;
      }
      for (const dur of [d.min, d.max]) {
        if (!isNum(dur)) continue;
        const t = atTime(sp.at, dur);
        if (sp.at.anchor === "ratio" && sp.at.value > 1) { err(`${q}: ratio debe estar en 0..1`); break; }
        if (t < -1e-9 || t > dur + 1e-9) { err(`${q}: cae fuera de la escena con duración ${dur}`); break; }
        if (isNum(sp.span) && t + sp.span > dur + 1e-9) { err(`${q}: t+span excede la escena con duración ${dur}`); break; }
      }
    }
  });

  for (const s of scenes) {
    for (const dep of s.dependsOn ?? []) {
      if (!ids.has(dep)) err(`${s.id}: dependsOn '${dep}' no existe`);
      else if (dep === s.id) err(`${s.id}: dependsOn no puede apuntar a sí misma`);
    }
  }

  const chosen = {};
  for (const s of scenes) chosen[s.id] = s.duration.target;
  for (const [id, v] of Object.entries(setOverrides)) {
    const s = scenes.find((x) => x.id === id);
    if (!s) err(`--set: escena '${id}' no existe`);
    else if (!isNum(v)) err(`--set ${id}: valor inválido`);
    else if (v < s.duration.min || v > s.duration.max) err(`--set ${id}=${v}: fuera de rango [${s.duration.min}, ${s.duration.max}]`);
    else chosen[id] = v;
  }

  const sumT = scenes.reduce((a, s) => a + chosen[s.id], 0);
  const sumMin = scenes.reduce((a, s) => a + s.duration.min, 0);
  const sumMax = scenes.reduce((a, s) => a + s.duration.max, 0);
  if (sumT < td.min - 1e-9 || sumT > td.max + 1e-9) err(`Σ duraciones (${round(sumT)}) fuera de totalDuration [${td.min}, ${td.max}]`);
  if (sumMin > td.max + 1e-9) err(`Σ min (${round(sumMin)}) excede totalDuration.max (${td.max})`);
  if (sumMax < td.min - 1e-9) err(`Σ max (${round(sumMax)}) es menor que totalDuration.min (${td.min})`);

  const frame = 1 / f.fps;
  let cursor = 0;
  const resolvedScenes = scenes.map((s) => {
    const dur = chosen[s.id];
    const start = cursor;
    cursor += dur;
    for (const [label, v] of [[`inicio de ${s.id}`, start], [`duración de ${s.id}`, dur]]) {
      if (Math.abs(v / frame - Math.round(v / frame)) > 1e-6) {
        warn(`${label} (${round(v)} s) no cae en la grilla de frames (1/${f.fps} s)`);
      }
    }
    const tr = s.transitionOut ?? { type: "none", duration: 0 };
    return {
      id: s.id,
      order: s.order,
      system: s.system,
      mode: s.duration.mode,
      start: round(start),
      duration: round(dur),
      end: round(start + dur),
      range: [s.duration.min, s.duration.max],
      transition: { type: tr.type, from: round(start + dur - tr.duration), duration: tr.duration },
      holdStart: s.constraints?.minHoldSeconds ? round(start + dur - s.constraints.minHoldSeconds) : null,
      syncPoints: (s.syncPoints ?? []).map((sp) => ({
        id: sp.id,
        t: round(atTime(sp.at, dur)),
        tGlobal: round(start + atTime(sp.at, dur)),
        span: sp.span ?? null
      }))
    };
  });

  if (errors.length) return { ok: false, errors, warnings, resolved: null };

  return {
    ok: true,
    errors,
    warnings,
    resolved: {
      videoId: doc.videoId,
      revision: doc.revision,
      status: doc.status,
      format: { width: f.width, height: f.height, fps: f.fps },
      fps: f.fps,
      total: round(cursor),
      scenes: resolvedScenes
    }
  };
}

function runCli() {
  const argv = process.argv.slice(2);
  const flags = { table: false, json: false, set: {} };
  let file;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--table") flags.table = true;
    else if (a === "--json") flags.json = true;
    else if (a === "--set") {
      const [id, v] = String(argv[++i] ?? "").split("=");
      flags.set[id] = Number(v);
    } else if (!a.startsWith("--")) file = a;
  }
  if (!file) {
    console.error("Uso: validate-timing.mjs <timing.json> [--table] [--json] [--set ID=seg]");
    process.exit(2);
  }

  let doc;
  try {
    doc = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.error(`ERROR: no se pudo leer/parsear ${file}: ${e.message}`);
    process.exit(2);
  }

  const { ok, errors, warnings, resolved } = validateAndResolveTiming(doc, flags.set);
  if (!ok) {
    console.error(`INVÁLIDO — ${errors.length} error(es):`);
    errors.forEach((e) => console.error(`  ✗ ${e}`));
    if (warnings.length) warnings.forEach((w) => console.error(`  ⚠ ${w}`));
    process.exit(1);
  }
  if (warnings.length) warnings.forEach((w) => console.error(`  ⚠ ${w}`));

  if (flags.json) {
    console.log(JSON.stringify({
      videoId: resolved.videoId,
      revision: resolved.revision,
      fps: resolved.fps,
      total: resolved.total,
      scenes: resolved.scenes
    }, null, 2));
  } else {
    console.log(`OK — ${resolved.videoId} rev ${resolved.revision} (${resolved.status}) · ${resolved.scenes.length} escenas · total ${resolved.total} s · sin dependencia de audio`);
    if (flags.table) {
      console.log("\nid    sist  modo       inicio   dur   rango        fin    transición            hold-final");
      for (const r of resolved.scenes) {
        console.log(
          `${r.id.padEnd(5)} ${r.system.padEnd(4)}  ${r.mode.padEnd(9)} ${String(r.start).padStart(6)}  ${String(r.duration).padStart(4)}  ${`${r.range[0]}–${r.range[1]}`.padEnd(11)}  ${String(r.end).padStart(5)}  ${`${r.transition.type} ${r.transition.duration}s`.padEnd(20)}  ${r.holdStart ?? "—"}`
        );
      }
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
