// Generates Jack's lines 1, 7 and 9 in several voice treatments, to choose his voice.
//   node scripts/voice-options.mjs
// Output: out/voice-v2-A.mp3, -B.mp3, -C.mp3
import { execSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { changeSpeed, encodeWav, joinClips, kokoroProfile, readWavFile, renderLine, ensureDir } from "./voice-lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OPTIONS = [
  { tag: "A", voice: "bm_fable", semitones: 1.5, speed: 1.02 },

  { tag: "B", voice: "bm_lewis", semitones: 1, speed: 1.0 },
  { tag: "C", voice: "bm_daniel", semitones: 1, speed: 1.05 },
];
const LINES = [`Clawd, my code review just came back. "Excellent work." Thing is, you wrote half of it.`, "Lucky you.", "So you're less a replacement, more a very fast intern."];

for (const o of OPTIONS) {
  const profile = await kokoroProfile(`Jack option ${o.voice}`, o.voice);
  const rendered = [];
  for (const text of LINES) rendered.push(await renderLine(profile.id, text, { semitones: o.semitones }));
  const rate = rendered[0].rate, wav = join(root, "out", `voice-v2-${o.tag}.wav`), mp3 = wav.replace(/wav$/, "mp3");
  ensureDir(wav);
  writeFileSync(wav, encodeWav(joinClips(rendered.map((r) => r.samples), rate, 0.5), rate));
  changeSpeed(wav, o.speed, root);
  execSync(`npx --no-install remotion ffmpeg -y -v error -i "${wav}" -c:a libmp3lame -b:a 96k "${mp3}"`, { cwd: root, stdio: "pipe" });
  rmSync(wav);
  console.log(o.tag, o.voice, `+${o.semitones} st`, `x${o.speed}`, readWavFile ? "ok" : "");
}
