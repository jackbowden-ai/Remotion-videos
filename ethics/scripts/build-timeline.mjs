// Places the voice lines on the film's timeline and measures when each is actually sounding.
//
//   node scripts/build-timeline.mjs
//
// Reads public/audio/lines (timings.json + WAVs). Writes the same timeline for both halves of the pipeline:
//   animation/src/scenes/ethics_timeline.js   read by the painted scenes (mouths, camera, acting, beats)
//   src/remotion/ethics-timeline.json         read by the Ethics composition (voices, captions, sound effects)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", "audio", "lines");
const FPS = 24;
const ENV_RATE = FPS; // one mouth level per video frame
const OPENING = 1.7; // when the first word is heard: review arrives, Clawd peeks
// Turn-taking beat between one line's last sound and the next line's first. The longer ones carry a gag on screen.
const FIRE_LEN = 2.2, PAGER_LEN = 2.25; // the two cutaways
const GAP_AFTER = { 1: 0.55, 2: 0.35 + FIRE_LEN + 0.35, 3: 0.45, 4: 0.5, 5: 0.5, 6: 0.1 + PAGER_LEN + 0.4, 7: 0.45, 8: 0.5, 9: 0.45, 10: 1.15, 11: 0.6 };
const TAIL = 4.0; // after the last word: both working, second green check, brush wipe

// Captions, a line split where it would run past two rows on screen.
const CAPTIONS = {
  1: [`Clawd, my code review just came back.`, `3 approvals and an "Excellent work."`, `Thing is, you wrote half of it.`],
  2: [`And you wrote the other half.`, `Plus all the bugs.`],
  3: [`Should I tell the team you helped me build it?`],
  4: [`Yes, being open builds trust,`, `I can't take all the credit.`],
  5: [`But if it breaks in production,`, `who's responsible?`],
  6: [`You are, I am not the one who gets paged`, `at three in the morning.`],
  7: [`Lucky being you.`],
  8: [`That's why you review every line I write.`, `Understand it, test it, own it.`],
  9: [`So you're less a replacement,`, `more a very fast collaborator.`],
  10: [`A very fast collaborator who never steals your lunch.`],
  11: [`Alright then, help me write these tests.`],
  12: [`Together, this time.`],
};

function readWav(path) {
  const buf = readFileSync(path);
  let pos = 12, fmt, data;
  while (pos + 8 <= buf.length) {
    const id = buf.toString("ascii", pos, pos + 4), size = buf.readUInt32LE(pos + 4);
    if (id === "fmt ") fmt = { tag: buf.readUInt16LE(pos + 8), ch: buf.readUInt16LE(pos + 10), rate: buf.readUInt32LE(pos + 12), bits: buf.readUInt16LE(pos + 22) };
    if (id === "data") data = buf.subarray(pos + 8, Math.min(buf.length, pos + 8 + size));
    pos += 8 + size + (size % 2);
  }
  const step = (fmt.bits / 8) * fmt.ch, n = Math.floor(data.length / step), s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (fmt.bits === 16) s[i] = data.readInt16LE(i * step) / 32768;
    else if (fmt.bits === 32 && fmt.tag === 3) s[i] = data.readFloatLE(i * step);
    else throw new Error(`Unsupported WAV: ${JSON.stringify(fmt)}`);
  }
  return { s, rate: fmt.rate };
}

const round = (v, d = 3) => +v.toFixed(d);
const onFrame = (t) => Math.round(t * FPS) / FPS;
const timings = JSON.parse(readFileSync(join(dir, "timings.json"), "utf8"));
let cursor = OPENING; // the moment the next line's first sound should land
const lines = [];

for (const k of Object.keys(timings).map(Number).sort((a, b) => a - b)) {
  const t = timings[k], { s, rate } = readWav(join(dir, t.file));
  const win = Math.round(rate / ENV_RATE), rms = [];
  for (let i = 0; i < s.length; i += win) {
    let e = 0, m = Math.min(s.length, i + win);
    for (let j = i; j < m; j++) e += s[j] * s[j];
    rms.push(Math.sqrt(e / (m - i)));
  }
  const peak = Math.max(...rms), raw = rms.map((v) => Math.min(1, v / (peak * 0.8)));
  const env = raw.map((v, i) => round((v + (raw[i - 1] ?? v)) / 2, 2)); // about 2 frames of smoothing
  const on = raw.map((v) => v > 0.08);
  const speechStart = on.indexOf(true) / ENV_RATE, speechEnd = (on.lastIndexOf(true) + 1) / ENV_RATE;
  // Pauses inside the line (at least 0.17 s): where phrases break, for landing the acting on the words.
  const pauses = [];
  for (let i = on.indexOf(true), run = 0; i <= on.lastIndexOf(true); i++) {
    if (!on[i]) run++;
    else { if (run >= 4) pauses.push([round((i - run) / ENV_RATE, 2), round(i / ENV_RATE, 2)]); run = 0; }
  }
  const start = round(onFrame(Math.max(0, cursor - speechStart)));
  lines.push({ n: k, who: t.who, start, dur: round(t.duration), speechStart: round(speechStart, 2), speechEnd: round(speechEnd, 2), pauses, env, file: `audio/lines/${t.file}` });
  cursor = start + speechEnd + (GAP_AFTER[k] ?? 0);
}

const L = (n) => lines[n - 1];
const say = (n) => L(n).start + L(n).speechStart; // first sound of line n
const end = (n) => L(n).start + L(n).speechEnd; // last sound of line n
const duration = round(Math.ceil((end(12) + TAIL) * FPS) / FPS);
const durationInFrames = Math.round(duration * FPS);

// Story beats shared by the paint and the sound, so that they stay locked together.
const beats = {
  check1: 0.55, peek: 1.0,
  red: round(say(5) + (L(5).pauses[0] ? L(5).pauses[0][0] - L(5).speechStart - 0.3 : (end(5) - say(5)) * 0.55)),
  fireIn: round(onFrame(end(2) + 0.35)), fireOut: round(onFrame(end(2) + 0.35 + FIRE_LEN)),
  pagerIn: round(onFrame(end(6) + 0.1)), pagerOut: round(onFrame(end(6) + 0.1 + PAGER_LEN)),
  lid: round(end(10) + 0.15), hop2: round(end(11) + 0.05),
  check2: round(end(12) + 1.1), wipeOut: round(duration - 0.95),
};
beats.ring = round(beats.pagerIn + 0.55);
beats.ignite = round(beats.fireIn + 0.55);
beats.wipeMid = round(say(9) - 0.1);

const captions = [];
for (const l of lines) {
  const parts = CAPTIONS[l.n], from = l.start + l.speechStart, to = l.start + l.speechEnd;
  const total = parts.reduce((a, p) => a + p.length, 0);
  const pausesAbs = l.pauses.map((p) => l.start + (p[0] + p[1]) / 2);
  let at = from, used = 0;
  parts.forEach((text, i) => {
    used += text.length;
    let until = i === parts.length - 1 ? to : from + ((to - from) * used) / total;
    if (i < parts.length - 1) { // snap the split to the speaker's own pause when one is close
      const near = pausesAbs.reduce((b, p) => (Math.abs(p - until) < Math.abs(b - until) ? p : b), Infinity);
      if (Math.abs(near - until) < 0.45) until = near;
    }
    captions.push({ text, who: l.who, fromFrame: Math.round(at * FPS), toFrame: Math.round((i === parts.length - 1 ? until + 0.25 : until) * FPS) });
    at = until;
  });
}

const sfxAt = (file, t, gainDb, until) => ({ file: `audio/sfx/${file}`, frame: Math.round(t * FPS), gainDb, durFrames: until ? Math.round((until - t) * FPS) : FPS * 4 });
const sfx = [
  sfxAt("whoosh.wav", 0, -20), sfxAt("pop.wav", beats.peek, -22), sfxAt("pop.wav", beats.check1, -17),
  sfxAt("pop.wav", beats.red, -18),
  sfxAt("whoosh.wav", beats.pagerIn - 0.3, -20), sfxAt("pager.wav", beats.ring, -18, beats.pagerOut),
  sfxAt("whoosh.wav", beats.fireIn - 0.3, -20), sfxAt("pop.wav", beats.ignite, -15), sfxAt("fire.wav", beats.ignite, -17, beats.fireOut), sfxAt("alarm.wav", beats.fireIn + 0.85, -25, beats.fireOut), sfxAt("whoosh.wav", beats.fireOut - 0.15, -20),
  sfxAt("whoosh.wav", beats.pagerOut - 0.15, -20),
  sfxAt("whoosh.wav", beats.wipeMid - 0.2, -21), sfxAt("pop.wav", L(10).start - 0.25, -17), sfxAt("pop.wav", beats.lid, -14),
  sfxAt("pop.wav", beats.check2, -15), sfxAt("whoosh.wav", beats.wipeOut, -18),
];
// Typing is only heard while Jack's hands are moving on the keyboard.
const typing = [[0, Math.round(0.5 * FPS)], [Math.round((end(11) + 0.4) * FPS), Math.round(beats.check2 * FPS)]];

writeFileSync(join(root, "animation", "src", "scenes", "ethics_timeline.js"), `// Generated by scripts/build-timeline.mjs. Do not edit by hand.\nconst ETHICS = ${JSON.stringify({ duration, fps: FPS, envRate: ENV_RATE, beats, lines })};\n`);
writeFileSync(join(root, "animation", "src", "config.js"), `// config.js: project settings. Written by scripts/build-timeline.mjs.\n//   duration: the video's length in seconds.\n//   bpm:      the rhythm that bounces, dances and pulse() follow.\nconst PROJECT = { duration: ${duration}, bpm: 90, offset: 0 };\n`);
writeFileSync(join(root, "src", "remotion", "ethics-timeline.json"), JSON.stringify({
  fps: FPS, durationInFrames,
  cutaways: [[Math.round(beats.fireIn * FPS), Math.round(beats.fireOut * FPS)], [Math.round(beats.pagerIn * FPS), Math.round(beats.pagerOut * FPS)]],
  lines: lines.map(({ n, who, start, dur, speechStart, speechEnd, file }) => ({ n, who, startFrame: Math.round(start * FPS), durFrames: Math.ceil(dur * FPS), speechFrom: Math.round((start + speechStart) * FPS), speechTo: Math.round((start + speechEnd) * FPS), file })),
  captions, sfx, typing,
}, null, 2));

console.log(`duration ${duration}s (${durationInFrames} frames)`);
console.log(JSON.stringify(beats));
for (let i = 0; i < lines.length; i++) { const l = lines[i]; console.log(`${String(l.n).padStart(2)} ${l.who.padEnd(5)} speech ${(l.start + l.speechStart).toFixed(2)}-${(l.start + l.speechEnd).toFixed(2)}  pauses ${JSON.stringify(l.pauses)}`); }
