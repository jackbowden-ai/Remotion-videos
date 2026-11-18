// Synthesises every sound effect from scratch, so there are no third-party samples to credit or license.
//   node scripts/make-sfx.mjs
// Output: public/audio/sfx/*.wav (44.1 kHz, 16-bit mono)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "audio", "sfx");
const RATE = 44100;
mkdirSync(outDir, { recursive: true });

let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const noise = () => rnd() * 2 - 1;
const TAU = Math.PI * 2;

function save(name, s) {
  let peak = 0;
  for (const v of s) peak = Math.max(peak, Math.abs(v));
  const k = peak > 0 ? 0.9 / peak : 1;
  const b = Buffer.alloc(44 + s.length * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + s.length * 2, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(RATE, 24); b.writeUInt32LE(RATE * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(s.length * 2, 40);
  s.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * k)) * 32767), 44 + i * 2));
  writeFileSync(join(outDir, name), b);
  console.log(name, (s.length / RATE).toFixed(2) + "s");
}
const buffer = (sec) => new Float32Array(Math.round(sec * RATE));

function addClick(s, at, level, bright) {   // one key: a short noisy tick with a low thud
  const n = Math.round(0.03 * RATE), i0 = Math.round(at * RATE);
  let lp = 0;
  for (let i = 0; i < n && i0 + i < s.length; i++) {
    const t = i / RATE; lp += bright * (noise() - lp);
    s[i0 + i] += level * (lp * Math.exp(-t * 260) + 0.6 * Math.sin(TAU * 170 * t) * Math.exp(-t * 140));
  }
}

// Room tone: soft air and a low hum, seamless to loop, with a few distant keys from the office.
{
  const sec = 12, s = buffer(sec);
  let a = 0, b = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / RATE; a += 0.018 * (noise() - a); b += 0.15 * (noise() - b);
    s[i] = 2.2 * a + 0.12 * b + 0.025 * Math.sin(TAU * 60 * t) + 0.012 * Math.sin(TAU * 120 * t);
  }
  const fade = Math.round(0.4 * RATE);   // crossfade the end into the start
  for (let i = 0; i < fade; i++) { const k = i / fade; s[i] = s[i] * k + s[s.length - fade + i] * (1 - k); }
  const out = s.subarray(0, s.length - fade);
  for (let c = 0; c < 30; c++) addClick(out, 0.5 + rnd() * (out.length / RATE - 1), 0.05, 0.5);
  save("roomtone.wav", out);
}

// Typing: uneven bursts of key clicks, to loop.
{
  const s = buffer(6);
  let t = 0.05;
  while (t < 5.8) {
    addClick(s, t, 0.5 + rnd() * 0.5, 0.5 + rnd() * 0.4);
    t += rnd() < 0.12 ? 0.25 + rnd() * 0.25 : 0.075 + rnd() * 0.09;
  }
  save("typing.wav", s);
}

// Pager: insistent double beeps with a rattling buzz underneath.
{
  const sec = 2.4, s = buffer(sec);
  for (let i = 0; i < s.length; i++) {
    const t = i / RATE, cycle = t % 0.42;
    const beep = (cycle < 0.09 || (cycle > 0.14 && cycle < 0.23)) ? 1 : 0;
    const buzz = t % 0.84 < 0.6 ? 1 : 0;
    s[i] = beep * Math.sign(Math.sin(TAU * 2350 * t)) * 0.35 + buzz * (0.45 * Math.sign(Math.sin(TAU * 148 * t)) * (0.7 + 0.3 * Math.sin(TAU * 31 * t)) + 0.12 * noise());
  }
  const edge = Math.round(0.02 * RATE);
  for (let i = 0; i < edge; i++) { s[i] *= i / edge; s[s.length - 1 - i] *= i / edge; }
  save("pager.wav", s);
}

// Whoosh: noise that sweeps up and away with the brush wipe.
{
  const sec = 0.75, s = buffer(sec);
  let lp = 0, hp = 0;
  for (let i = 0; i < s.length; i++) {
    const k = i / s.length, cut = 0.02 + 0.35 * Math.sin(Math.PI * k) ** 2;
    const n = noise(); lp += cut * (n - lp); hp += 0.02 * (lp - hp);
    s[i] = (lp - hp) * Math.sin(Math.PI * k) ** 1.5;
  }
  save("whoosh.wav", s);
}

// Fire: a low roar with crackles, swelling up.
{
  const sec = 2.0, s = buffer(sec);
  let lp = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / RATE, swell = Math.min(1, t / 0.7); lp += 0.05 * (noise() - lp);
    s[i] = 2.4 * lp * swell * (0.75 + 0.25 * Math.sin(TAU * 7 * t + Math.sin(TAU * 3 * t)));
  }
  for (let c = 0; c < 70; c++) addClick(s, Math.pow(rnd(), 0.7) * (sec - 0.1), 0.35 + rnd() * 0.5, 0.8);
  save("fire.wav", s);
}

// Alarm: a two-tone warble.
{
  const sec = 1.4, s = buffer(sec);
  for (let i = 0; i < s.length; i++) {
    const t = i / RATE, f = t % 0.34 < 0.17 ? 880 : 660;
    s[i] = 0.5 * Math.sign(Math.sin(TAU * f * t)) + 0.3 * Math.sin(TAU * f * 2 * t);
  }
  const edge = Math.round(0.02 * RATE);
  for (let i = 0; i < edge; i++) { s[i] *= i / edge; s[s.length - 1 - i] *= i / edge; }
  save("alarm.wav", s);
}

// Pop: a quick falling tone, for Clawd's lid and the ticks landing.
{
  const sec = 0.16, s = buffer(sec);
  let phase = 0;
  for (let i = 0; i < s.length; i++) {
    const t = i / RATE; phase += (TAU * (240 + 620 * Math.exp(-t * 40))) / RATE;
    s[i] = Math.sin(phase) * Math.min(1, t * 900) * Math.exp(-t * 26);
  }
  save("pop.wav", s);
}
