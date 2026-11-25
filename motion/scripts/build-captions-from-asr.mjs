#!/usr/bin/env node
/**
 * Genera captions.json y captions.srt desde una transcripción ASR palabra a palabra
 * (transcript.json generado por `hyperframes transcribe -e parakeet -l es`) y un archivo
 * opcional asr-overrides.json con correcciones de puntuación o fonéticas auditables.
 *
 * Uso:
 *   node build-captions-from-asr.mjs <videoId> [--max-chars 36] [--max-words 8]
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const REPO_ROOT = resolve(__dirname, "..", "..");

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

function formatSrtTime(sec) {
  const msTotal = Math.round(sec * 1000);
  const h = Math.floor(msTotal / 3600000);
  const m = Math.floor((msTotal % 3600000) / 60000);
  const s = Math.floor((msTotal % 60000) / 1000);
  const ms = msTotal % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function wrapTwoLines(text, maxLineChars = 34) {
  const words = text.split(/\s+/).filter(Boolean);
  if (text.length <= maxLineChars || words.length <= 2) return text;
  let bestSplit = Math.ceil(words.length / 2);
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const l1 = words.slice(0, i).join(" ");
    const l2 = words.slice(i).join(" ");
    if (l1.length <= maxLineChars + 4 && l2.length <= maxLineChars + 4) {
      const diff = Math.abs(l1.length - l2.length);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestSplit = i;
      }
    }
  }
  return `${words.slice(0, bestSplit).join(" ")}\n${words.slice(bestSplit).join(" ")}`;
}

function buildCues(words, { maxChars = 66, maxWords = 10, pauseSplitSec = 0.28 } = {}) {
  const groups = [];
  let cur = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prev = cur[cur.length - 1];
    const gap = prev ? w.start - prev.end : 0;
    const prevEndsSentence = prev && /[.!?:]$/.test(prev.text);
    const prevEndsClause = prev && /[,;]$/.test(prev.text);
    const curTextLen = cur.map((x) => x.text).join(" ").length;

    const shouldSplit =
      cur.length > 0 &&
      (prevEndsSentence ||
        gap >= pauseSplitSec ||
        (prevEndsClause && cur.length >= 2) ||
        cur.length >= maxWords ||
        curTextLen + 1 + w.text.length > maxChars);

    if (shouldSplit) {
      groups.push(cur);
      cur = [w];
    } else {
      cur.push(w);
    }
  }
  if (cur.length > 0) groups.push(cur);

  // Construir cues sin solapamientos ni micro-cortes: si la pausa hasta el siguiente cue es <= 0.45s,
  // extender end exactamente hasta nextStart para transición continua sin parpadeo.
  const rawStarts = groups.map((g) => round3(Math.max(0, g[0].start - 0.04)));
  const cues = groups.map((g, idx) => {
    const start = rawStarts[idx];
    const nextStart = idx + 1 < groups.length ? rawStarts[idx + 1] : null;
    const naturalEnd = round3(g[g.length - 1].end + 0.14);
    let end;
    if (nextStart !== null) {
      const gapToNext = nextStart - g[g.length - 1].end;
      end = gapToNext <= 0.45 ? nextStart : Math.min(naturalEnd, nextStart);
    } else {
      end = naturalEnd;
    }
    const rawText = g.map((x) => x.text).join(" ").trim();
    return {
      id: `C${String(idx + 1).padStart(2, "0")}`,
      start,
      end: Math.max(round3(start + 0.25), round3(end)),
      text: wrapTwoLines(rawText)
    };
  });

  return cues;
}

function main() {
  const argv = process.argv.slice(2);
  let videoId = null;
  let maxChars = 64;
  let maxWords = 9;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--max-chars") maxChars = Number(argv[++i]);
    else if (argv[i] === "--max-words") maxWords = Number(argv[++i]);
    else if (!argv[i].startsWith("--")) videoId = argv[i];
  }

  if (!videoId) {
    console.error("Uso: build-captions-from-asr.mjs <videoId> [--max-chars 64] [--max-words 9]");
    process.exit(2);
  }

  const audioDir = join(REPO_ROOT, "content", "videos", videoId, "audio");
  const transcriptPath = join(audioDir, "transcript.json");
  const overridesPath = join(audioDir, "asr-overrides.json");
  if (!existsSync(transcriptPath)) {
    throw new Error(`No se encontró ${transcriptPath}. Ejecutá primero hyperframes transcribe.`);
  }

  const rawWords = JSON.parse(readFileSync(transcriptPath, "utf8"));
  const overrides = existsSync(overridesPath)
    ? JSON.parse(readFileSync(overridesPath, "utf8"))?.wordOverrides ?? {}
    : {};

  const words = rawWords.map((w) => ({
    ...w,
    text: overrides[w.id] ?? w.text
  }));

  const cues = buildCues(words, { maxChars, maxWords });

  const captionsJson = {
    schemaVersion: "1.0",
    videoId,
    sourceAudio: "voiceover.wav",
    transcriptSource: "transcript.json (parakeet-tdt-0.6b-v3)",
    cues
  };

  writeFileSync(join(audioDir, "captions.json"), `${JSON.stringify(captionsJson, null, 2)}\n`, "utf8");

  const srt = cues
    .map((c, idx) => `${idx + 1}\n${formatSrtTime(c.start)} --> ${formatSrtTime(c.end)}\n${c.text}\n`)
    .join("\n");
  writeFileSync(join(audioDir, "captions.srt"), srt, "utf8");

  console.log(`[build-captions-from-asr] OK (${videoId}) · ${words.length} palabras -> ${cues.length} subtítulos en captions.json y captions.srt`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
