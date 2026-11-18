import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

// Plays frames copied to public/scenes/<scene>/ by scripts/sync-frames.mjs.
// step 2 holds each painted frame for two video frames, for drafts.
export const ImageSequence: React.FC<{ scene: string; step?: number }> = ({ scene, step = 1 }) => {
  const frame = useCurrentFrame() - (useCurrentFrame() % step);
  const file = `f${String(frame).padStart(5, "0")}.jpg`;

  return (
    <AbsoluteFill>
      <Img src={staticFile(`scenes/${scene}/${file}`)} />
    </AbsoluteFill>
  );
};
