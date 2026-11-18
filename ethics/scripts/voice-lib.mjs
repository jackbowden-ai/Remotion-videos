// Shared voice pipeline: generate a line sentence by sentence through Voicebox, trim each sentence, and join them with
// controlled pauses, so that both characters are paced the same way.
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const API = "http://127.0.0.1:17493";
export const SENTENCE_PAUSE = 0.4; // seconds from one sentence ending to the next one sounding
export const COMMA_PAUSE = 0.3; // the same, at a comma: a clear but shorter break
const PRE_ROLL = 0.07; // kept before each onset, so that quiet hard consonants are not clipped

export const json = async (path, init) => {
  const res = await fetch(API + path, init);
  const body = await res.text();
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status} ${body.slice(0, 300)}`);
  return JSON.parse(body);
};
export const post = (path, data) => json(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });

export async function kokoroProfile(name, voice) {
  const all = await json("/profiles");
  return all.find((p) => p.name === name) ??
    post("/profiles", { name, language: "en", voice_type: "preset", preset_engine: "kokoro", preset_voice_id: voice, default_engine: "kokoro" });
}

export function parseWav(buf) {
  let pos = 12, fmt, data;
  while (pos + 8 <= buf.length) {
    const id = buf.toString("ascii", pos, pos + 4), size = buf.readUInt32LE(pos + 4);
    if (id === "fmt ") fmt = { tag: buf.readUInt16LE(pos + 8), ch: buf.readUInt16LE(pos + 10), rate: buf.readUInt32LE(pos + 12), bits: buf.readUInt16LE(pos + 22) };
    if (id === "data") data = buf.subarray(pos + 8, Math.min(buf.length, pos + 8 + size));
    pos += 8 + size + (size % 2);
  }
  const step = (fmt.bits / 8) * fmt.ch, n = Math.floor(data.length / step), samples = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (fmt.bits === 16) samples[i] = data.readInt16LE(i * step) / 32768;
    else if (fmt.bits === 32 && fmt.tag === 3) samples[i] = data.readFloatLE(i * step);
    else throw new Error(`Unsupported WAV: ${JSON.stringify(fmt)}`);
  }
  return { samples, rate: fmt.rate };
}

export function encodeWav(samples, rate) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  return b;
}

// Removes leading and trailing silence, keeping a few milliseconds so that consonants aren't clipped.
export function trim(samples, rate) {
  const win = Math.round(rate * 0.01), threshold = 0.012, pre = Math.round(rate * PRE_ROLL), post = Math.round(rate * 0.03);
  const loud = (i) => { let e = 0; for (let j = i; j < Math.min(samples.length, i + win); j++) e += samples[j] * samples[j]; return Math.sqrt(e / win) > threshold; };
  let a = 0; while (a < samples.length && !loud(a)) a += win;
  let z = samples.length - win; while (z > a && !loud(z)) z -= win;
  return samples.subarray(Math.max(0, a - pre), Math.min(samples.length, z + win + post));
}

// Fades a few milliseconds at both ends, so that joins don't click.
function feather(samples, rate) {
  const out = Float32Array.from(samples), n = Math.min(Math.round(rate * 0.012), Math.floor(out.length / 2));
  for (let i = 0; i < n; i++) { out[i] *= i / n; out[out.length - 1 - i] *= i / n; }
  return out;
}

// Splits at full stops, question marks and commas. A comma's phrase is read as if it ended in a full stop, for a real break.
export function splitPhrases(text) {
  return text.replace(/["\u201C\u201D]/g, "").match(/[^.?!,]+[.?!,]+/g).map((s) => {
    const part = s.trim(), comma = part.endsWith(",");
    return { text: comma ? part.slice(0, -1) + "." : part, pause: comma ? COMMA_PAUSE : SENTENCE_PAUSE };
  });
}

async function generateSentence(profileId, text, semitones) {
  const body = { profile_id: profileId, text, language: "en", engine: "kokoro", personality: false };
  if (semitones) body.effects_chain = [{ type: "pitch_shift", enabled: true, params: { semitones } }];
  const { id } = await post("/generate", body);
  for (let i = 0; i < 600; i++) {
    const g = await json(`/history/${id}`);
    if (g.status === "completed") break;
    if (g.status === "failed") throw new Error(`Generation failed: ${g.error}`);
    await new Promise((r) => setTimeout(r, 400));
  }
  const res = await fetch(`${API}/audio/${id}`);
  if (!res.ok) throw new Error(`/audio/${id}: HTTP ${res.status}`);
  return parseWav(Buffer.from(await res.arrayBuffer()));
}

export function joinClips(clips, rate, pause = SENTENCE_PAUSE) {
  const gaps = clips.map((_, i) => (i < clips.length - 1 ? Math.round(rate * (Array.isArray(pause) ? pause[i] : pause)) : 0));
  const out = new Float32Array(clips.reduce((a, c) => a + c.length, 0) + gaps.reduce((a, g) => a + g, 0));
  let at = 0;
  clips.forEach((c, i) => { out.set(c, at); at += c.length + gaps[i]; });
  return out;
}

// One script line: every sentence generated, trimmed and joined. Returns { samples, rate }.
export async function renderLine(profileId, text, { semitones = 0 } = {}) {
  const clips = [];
  let rate;
  const phrases = splitPhrases(text);
  for (const phrase of phrases) {
    const g = await generateSentence(profileId, phrase.text, semitones);
    rate = g.rate;
    clips.push(feather(trim(g.samples, rate), rate));
  }
  return { samples: joinClips(clips, rate, phrases.map((p) => p.pause - (PRE_ROLL - 0.03))), rate }; // the extra pre-roll comes out of the gap
}

// Pitch-preserving speed change, in place, with Remotion's bundled ffmpeg.
export function changeSpeed(wavPath, speed, cwd) {
  if (!speed || speed === 1) return;
  const tmp = `${wavPath}.tmp.wav`;
  execSync(`npx --no-install remotion ffmpeg -y -v error -i "${wavPath}" -af atempo=${speed} -c:a pcm_s16le "${tmp}"`, { cwd, stdio: "pipe" });
  renameSync(tmp, wavPath);
}

export const ensureDir = (file) => mkdirSync(dirname(file), { recursive: true });
export const readWavFile = (file) => parseWav(readFileSync(file));
