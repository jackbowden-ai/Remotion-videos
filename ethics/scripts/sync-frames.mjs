// Copies frames rendered by animation/ into Remotion's public folder.
//
//   node scripts/sync-frames.mjs <scene> [sourceDir]
//
// <scene> becomes public/scenes/<scene>/. sourceDir defaults to animation/out/frames.
// Existing .jpg frames in that scene folder are replaced, so a shorter re-render leaves no stale frames.
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [scene, source] = process.argv.slice(2);

if (!scene || !/^[\w-]+$/.test(scene)) {
  console.error("Usage: node scripts/sync-frames.mjs <scene> [sourceDir]  (scene: letters, digits, - or _)");
  process.exit(1);
}

const from = resolve(root, source ?? "animation/out/frames");
if (!existsSync(from)) {
  console.error(`No frames folder at ${from}. Run: node render.mjs --frames (in animation/)`);
  process.exit(1);
}

const frames = readdirSync(from).filter((f) => /^f\d{5}\.jpg$/.test(f)).sort();
if (frames.length === 0) {
  console.error(`No f#####.jpg frames in ${from}`);
  process.exit(1);
}

const to = join(root, "public", "scenes", scene);
mkdirSync(to, { recursive: true });
for (const f of readdirSync(to)) {
  if (f.endsWith(".jpg")) rmSync(join(to, f));
}
for (const f of frames) copyFileSync(join(from, f), join(to, f));

console.log(`Copied ${frames.length} frames (${frames[0]} to ${frames.at(-1)}) to public/scenes/${scene}`);
console.log(`Use durationInFrames={${frames.length}} for this scene's composition.`);
