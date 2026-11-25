#!/usr/bin/env node
/**
 * Pipeline reproducible G4 -> G5 (Visual-First):
 *  1. Inspecciona timing.json (sin modificarlo) y las pistas en content/videos/<id>/audio/.
 *  2. Mide duraciones reales con ffprobe. Si la voz excede el video visual, calcula la
 *     extensión del hold del último frame (sin acelerar, recortar ni desplazar la voz).
 *  3. Mezcla voz + música de fondo opcional con volumen configurable, fades y ducking
 *     automático (sidechaincompress) mediante ffmpeg local, sin altering velocidad.
 *  4. Genera compositions/captions.html desde audio/captions.json en zona segura.
 *  5. Actualiza index.html del proyecto (duración extendida, <audio> y track captions) y
 *     escribe generated/g5-manifest.json.
 *
 * Uso:
 *   node integrate-g5.mjs <videoId> [--music-db -18] [--tail 0.25] [--check]
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateAndResolveTiming } from "./validate-timing.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const REPO_ROOT = resolve(__dirname, "..", "..");

function probeAudio(filePath) {
  const out = execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration,size,format_name",
    "-show_entries", "stream=codec_name,sample_rate,channels,bits_per_sample",
    "-of", "json",
    filePath
  ]).toString("utf8");
  const data = JSON.parse(out);
  const stream = data.streams?.[0] ?? {};
  return {
    duration: Number(data.format?.duration ?? 0),
    size: Number(data.format?.size ?? 0),
    format: data.format?.format_name ?? "unknown",
    codec: stream.codec_name ?? "unknown",
    sampleRate: Number(stream.sample_rate ?? 0),
    channels: Number(stream.channels ?? 0)
  };
}

function ceilToFrame(seconds, fps) {
  return Math.ceil(seconds * fps - 1e-9) / fps;
}

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildCaptionsHtml(cues, width, height) {
  const cueDivs = cues
    .map((c) => {
      const dur = round3(c.end - c.start);
      const linesHtml = escapeHtml(c.text).replaceAll("\n", "<br />");
      return `        <div id="${c.id}" class="clip st-caption-cue" data-start="${round3(c.start)}" data-duration="${dur}" data-layout-allow-caption-zone="true">\n          <span class="st-caption-pill">${linesHtml}</span>\n        </div>`;
    })
    .join("\n");

  const tweens = cues
    .map((c, idx) => {
      const prevEnd = idx > 0 ? cues[idx - 1].end : -1;
      const isContinuous = idx > 0 && c.start - prevEnd <= 0.02;
      if (isContinuous) {
        // Transición continua sin caída a opacity: 0 para evitar parpadeo entre subtítulos contiguos
        return `          tl.fromTo("#${c.id}", { opacity: 1, y: 4 }, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, ${round3(c.start)});`;
      }
      return `          tl.fromTo("#${c.id}", { opacity: 0.2, y: 8 }, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, ${round3(c.start)});`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="../styles/tokens.css" />
    <link rel="stylesheet" href="../styles/brand-system.css" />
  </head>
  <body>
    <template>
      <style>
        #root {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
        .st-caption-cue {
          position: absolute;
          left: 150px;
          top: 1124px;
          width: 780px;
          height: 112px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 50;
        }
        .st-caption-pill {
          display: inline-block;
          max-width: 760px;
          padding: 14px 26px;
          border-radius: 16px;
          background-color: #101A39;
          color: #FBFBF4;
          font-family: var(--st-font-sans);
          font-size: 34px;
          font-weight: 700;
          line-height: 1.24;
          letter-spacing: -0.01em;
          border: 2px solid rgba(206, 239, 98, 0.45);
          box-shadow: 0 10px 26px rgba(16, 26, 57, 0.28);
        }
      </style>

      <div id="root" data-composition-id="captions" data-width="${width}" data-height="${height}">
${cueDivs}
      </div>

      <script>
        (function buildCaptions() {
          const tl = gsap.timeline({ paused: true });
${tweens}
          window.__timelines = window.__timelines || {};
          window.__timelines["captions"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
`;
}

function mixAudio({ voicePath, musicPath, outWavPath, finalDuration, musicGainDb, fadeInSec, fadeOutSec }) {
  mkdirSync(dirname(outWavPath), { recursive: true });
  const fadeOutStart = round3(Math.max(0.5, finalDuration - fadeOutSec));

  if (!musicPath || !existsSync(musicPath)) {
    execFileSync("ffmpeg", [
      "-v", "error", "-y",
      "-i", voicePath,
      "-af", `apad=whole_dur=${finalDuration},aformat=sample_fmts=s16:sample_rates=48000:channel_layouts=stereo`,
      outWavPath
    ]);
    return { mode: "voice-only" };
  }

  // Voz stereo 48kHz + música recortada sin cambiar velocidad + ducking por sidechain + fades + limitador anti-clipping
  const filter = [
    `[0:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,apad=whole_dur=${finalDuration},asplit=2[v_mix][v_sc]`,
    `[1:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,atrim=0:${finalDuration},asetpts=PTS-STARTPTS,volume=${musicGainDb}dB,afade=t=in:st=0:d=${fadeInSec},afade=t=out:st=${fadeOutStart}:d=${fadeOutSec}[m_base]`,
    `[m_base][v_sc]sidechaincompress=threshold=0.02:ratio=6:attack=80:release=450:makeup=1[m_ducked]`,
    `[v_mix][m_ducked]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95:attack=5:release=50[out]`
  ].join(";");

  execFileSync("ffmpeg", [
    "-v", "error", "-y",
    "-i", voicePath,
    "-i", musicPath,
    "-filter_complex", filter,
    "-map", "[out]",
    "-c:a", "pcm_s16le",
    "-ar", "48000",
    "-ac", "2",
    outWavPath
  ]);

  return {
    mode: "voice+ducked-music",
    musicGainDb,
    fadeInSec,
    fadeOutSec,
    ducking: { threshold: 0.02, ratio: 6, attackMs: 80, releaseMs: 450 }
  };
}

function replaceAttr(tagStr, attr, value) {
  const re = new RegExp(`(${attr}\\s*=\\s*)(["'])[^"']*\\2`);
  if (re.test(tagStr)) return tagStr.replace(re, `$1"${value}"`);
  return tagStr.replace(/>$/, ` ${attr}="${value}">`);
}

function updateIndexForG5(html, { lastSceneId, lastSceneDuration, finalDuration, width, height, audioRelPath, hasCaptions }) {
  let out = html;

  // 1. Extender root data-duration
  out = out.replace(/<div\b[^>]*\bid=(["'])root\1[^>]*>/, (tag) =>
    replaceAttr(tag, "data-duration", finalDuration)
  );

  // 2. Extender slot de la última escena (hold automático del último frame)
  const lastRe = new RegExp(`<div\\b[^>]*\\bdata-composition-id=(["'])${lastSceneId}\\1[^>]*>`);
  out = out.replace(lastRe, (tag) => replaceAttr(tag, "data-duration", lastSceneDuration));

  // 3. Limpiar bloque G5 anterior si existe
  out = out.replace(/\n?\s*<!-- ST:G5_START -->[\s\S]*?<!-- ST:G5_END -->/g, "");

  const g5Lines = ["      <!-- ST:G5_START -->"];
  if (hasCaptions) {
    g5Lines.push(
      `      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${finalDuration}" data-track-index="1" data-track-kind="captions" data-width="${width}" data-height="${height}"></div>`
    );
  }
  g5Lines.push(
    `      <audio id="g5-audio-mix" class="clip" src="${audioRelPath}" data-start="0" data-duration="${finalDuration}" data-volume="1" data-track-index="2"></audio>`,
    "      <!-- ST:G5_END -->"
  );

  out = out.replace("<!-- ST:SCENES_END -->", `<!-- ST:SCENES_END -->\n${g5Lines.join("\n")}`);
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  let videoId = null;
  let musicGainDb = -18;
  let tailSec = 0.25;
  let fadeInSec = 0.8;
  let fadeOutSec = 1.6;
  let checkOnly = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--music-db") musicGainDb = Number(argv[++i]);
    else if (a === "--tail") tailSec = Number(argv[++i]);
    else if (a === "--fade-in") fadeInSec = Number(argv[++i]);
    else if (a === "--fade-out") fadeOutSec = Number(argv[++i]);
    else if (a === "--check") checkOnly = true;
    else if (!a.startsWith("--")) videoId = a;
  }

  if (!videoId) {
    console.error("Uso: integrate-g5.mjs <videoId> [--music-db -18] [--tail 0.25] [--check]");
    process.exit(2);
  }

  const contentDir = join(REPO_ROOT, "content", "videos", videoId);
  const projectDir = join(REPO_ROOT, "video-generation", "projects", videoId);
  const timingPath = join(contentDir, "timing.json");
  const voicePath = join(contentDir, "audio", "voiceover.wav");
  const musicPath = join(contentDir, "audio", "background-music.mp3");
  const captionsJsonPath = join(contentDir, "audio", "captions.json");

  if (!existsSync(timingPath) || !existsSync(projectDir) || !existsSync(voicePath)) {
    throw new Error(`Faltan archivos requeridos en ${contentDir} o ${projectDir}`);
  }

  const doc = JSON.parse(readFileSync(timingPath, "utf8"));
  const { ok, errors, resolved } = validateAndResolveTiming(doc);
  if (!ok) throw new Error(`timing.json inválido:\n${errors.join("\n")}`);

  const voiceInfo = probeAudio(voicePath);
  const musicInfo = existsSync(musicPath) ? probeAudio(musicPath) : null;

  const baseDuration = resolved.total;
  const neededDuration = Math.max(baseDuration, voiceInfo.duration + tailSec);
  const finalDuration = round3(ceilToFrame(neededDuration, resolved.fps));
  const extensionSeconds = round3(finalDuration - baseDuration);

  const lastScene = resolved.scenes[resolved.scenes.length - 1];
  const lastSceneExtendedDuration = round3(lastScene.duration + extensionSeconds);

  let captionsData = null;
  if (existsSync(captionsJsonPath)) {
    captionsData = JSON.parse(readFileSync(captionsJsonPath, "utf8"));
    for (let i = 0; i < captionsData.cues.length; i++) {
      const c = captionsData.cues[i];
      if (c.end <= c.start) throw new Error(`Subtítulo inválido ${c.id}: end <= start`);
      if (c.end > finalDuration) throw new Error(`Subtítulo ${c.id} excede duración final (${finalDuration}s)`);
      if (i > 0 && c.start < captionsData.cues[i - 1].end - 1e-6) {
        throw new Error(`Solapamiento entre ${captionsData.cues[i - 1].id} y ${c.id}`);
      }
    }
  }

  if (checkOnly) {
    const manifestPath = join(projectDir, "generated", "g5-manifest.json");
    if (!existsSync(manifestPath)) throw new Error("Falta generated/g5-manifest.json");
    const m = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (m.finalDuration !== finalDuration || m.extensionSeconds !== extensionSeconds) {
      throw new Error(`Drift en g5-manifest.json (${m.finalDuration}s != ${finalDuration}s)`);
    }
    console.log(`[integrate-g5] VERIFICADO (${videoId}) · base=${baseDuration}s · voz=${round3(voiceInfo.duration)}s · final=${finalDuration}s (+${extensionSeconds}s hold en ${lastScene.id})`);
    return;
  }

  const audioRelPath = "assets/audio/g5-mix.wav";
  const outWavPath = join(projectDir, audioRelPath);
  const mixInfo = mixAudio({
    voicePath,
    musicPath: musicInfo ? musicPath : null,
    outWavPath,
    finalDuration,
    musicGainDb,
    fadeInSec,
    fadeOutSec
  });

  if (captionsData) {
    writeFileSync(
      join(projectDir, "compositions", "captions.html"),
      buildCaptionsHtml(captionsData.cues, resolved.format.width, resolved.format.height),
      "utf8"
    );
  }

  const indexPath = join(projectDir, "index.html");
  const updatedHtml = updateIndexForG5(readFileSync(indexPath, "utf8"), {
    lastSceneId: lastScene.id,
    lastSceneDuration: lastSceneExtendedDuration,
    finalDuration,
    width: resolved.format.width,
    height: resolved.format.height,
    audioRelPath,
    hasCaptions: Boolean(captionsData)
  });
  writeFileSync(indexPath, updatedHtml, "utf8");

  const manifest = {
    schemaVersion: "1.0",
    videoId,
    timingRevision: resolved.revision,
    baseVisualDuration: baseDuration,
    voiceoverDuration: round3(voiceInfo.duration),
    musicDuration: musicInfo ? round3(musicInfo.duration) : null,
    finalDuration,
    extensionSeconds,
    extendedScene: { id: lastScene.id, originalDuration: lastScene.duration, extendedDuration: lastSceneExtendedDuration },
    mix: mixInfo,
    captionsCount: captionsData ? captionsData.cues.length : 0
  };
  mkdirSync(join(projectDir, "generated"), { recursive: true });
  writeFileSync(join(projectDir, "generated", "g5-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    `[integrate-g5] OK (${videoId}) · base=${baseDuration}s · voz=${round3(voiceInfo.duration)}s · final=${finalDuration}s (+${extensionSeconds}s hold en ${lastScene.id}) · subtítulos=${manifest.captionsCount}`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
