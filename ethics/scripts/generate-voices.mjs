// Generates one WAV per script line through Voicebox (Kokoro), sentence by sentence with controlled pauses.
//
//   node scripts/generate-voices.mjs            all lines
//   node scripts/generate-voices.mjs 6 10       only these lines
//
// Output: public/audio/lines/NN.wav and public/audio/lines/timings.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { encodeWav, json, kokoroProfile, renderLine } from "./voice-lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "audio", "lines");
const CLAWD_PROFILE = "Claude animation";
const JACK_VOICE = "am_puck";

const LINES = [
  ["jack", `Clawd, my code review just came back. Three approvals and an "Excellent work." Thing is, you wrote half of it.`],
  ["clawd", "And you wrote the other half. Plus all the bugs."],
  ["jack", "Should I tell the team you helped me build it?"],
  ["clawd", "Yes, being open builds trust, I can't take all the credit."],
  ["jack", "But if it breaks in production, who's responsible?"],
  ["clawd", "You are, I am not the one who gets paged at three in the morning."],
  ["jack", "Lucky being you."],
  ["clawd", "That's why you review every line I write. Understand it, test it, own it."],
  ["jack", "So you're less a replacement, more a very fast collaborator."],
  ["clawd", "A very fast collaborator who never steals your lunch."],
  ["jack", "Alright then, help me write these tests."],
  ["clawd", "Together, this time."],
];

const profiles = await json("/profiles");
const clawd = profiles.find((p) => p.name === CLAWD_PROFILE);
if (!clawd) throw new Error(`No "${CLAWD_PROFILE}" profile in Voicebox`);
const jack = await kokoroProfile(`Jack ${JACK_VOICE}`, JACK_VOICE);
console.log(`Clawd: ${clawd.preset_voice_id}, Jack: ${jack.preset_voice_id}`);

mkdirSync(outDir, { recursive: true });
const only = process.argv.slice(2).map(Number);
const timingsPath = join(outDir, "timings.json");
const timings = existsSync(timingsPath) ? JSON.parse(readFileSync(timingsPath, "utf8")) : {};

async function transcribe(wav) {
  const form = new FormData();
  form.append("file", new Blob([wav], { type: "audio/wav" }), "line.wav");
  form.append("language", "en");
  return json("/transcribe", { method: "POST", body: form });
}

for (const [i, [who, text]] of LINES.entries()) {
  const n = i + 1;
  if (only.length && !only.includes(n)) continue;
  const name = `${String(n).padStart(2, "0")}.wav`;
  const { samples, rate } = await renderLine(who === "jack" ? jack.id : clawd.id, text);
  const wav = encodeWav(samples, rate);
  writeFileSync(join(outDir, name), wav);
  const heard = (await transcribe(wav)).text;
  timings[n] = { line: n, who, text, file: name, duration: samples.length / rate, heard };
  console.log(`${name} ${who.padEnd(5)} ${timings[n].duration.toFixed(2)}s  heard: ${heard}`);
  writeFileSync(timingsPath, JSON.stringify(timings, null, 2));
}
