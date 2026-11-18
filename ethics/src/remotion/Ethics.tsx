import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, getStaticFiles, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ImageSequence } from "./ImageSequence";
import timeline from "./ethics-timeline.json";

// Optional. Drop a track at public/audio/music.mp3 and it is picked up on the next render.
const MUSIC_FILE = "audio/music.mp3";

const dB = (v: number) => Math.pow(10, v / 20);
const MUSIC_BED = dB(-11); // under the voices
const MUSIC_DUCKED = dB(-15); // a little further under while someone speaks
const ROOM_GAIN = dB(-30);
const TYPING_GAIN = dB(-24);
const DUCK_FRAMES = 6;
const FADE_FRAMES = 36;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Caveat, SIL Open Font License, served from public/fonts.
loadFont({ family: "Caveat", url: staticFile("fonts/caveat-latin-600-normal.woff2"), weight: "600" });

const duck = (frame: number) => {
  let amount = 0;
  for (const l of timeline.lines) {
    amount = Math.max(amount, interpolate(frame, [l.speechFrom - DUCK_FRAMES, l.speechFrom, l.speechTo, l.speechTo + DUCK_FRAMES], [0, 1, 1, 0], clamp));
  }
  return amount;
};

const musicVolume = (frame: number) => {
  const fade = interpolate(frame, [0, FADE_FRAMES, timeline.durationInFrames - FADE_FRAMES, timeline.durationInFrames], [0, 1, 1, 0], clamp);
  return fade * interpolate(duck(frame), [0, 1], [MUSIC_BED, MUSIC_DUCKED]);
};

// The office sound drops out for the two cutaways.
const roomVolume = (frame: number) => {
  let level = interpolate(frame, [0, 12], [0, 1], clamp);
  for (const [a, b] of timeline.cutaways) level *= interpolate(frame, [a - 6, a, b, b + 6], [1, 0, 0, 1], clamp);
  return ROOM_GAIN * level;
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const cap = timeline.captions.find((c) => frame >= c.fromFrame && frame < c.toFrame);
  if (!cap) return null;
  const opacity = interpolate(frame, [cap.fromFrame, cap.fromFrame + 2, cap.toFrame - 3, cap.toFrame], [0, 1, 1, 0], clamp);
  const scale = interpolate(frame, [cap.fromFrame, cap.fromFrame + 3, cap.fromFrame + 6], [0.72, 1.08, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 56 }}>
      <div
        style={{
          fontFamily: "Caveat",
          fontWeight: 600,
          fontSize: 60,
          lineHeight: 1.05,
          color: "#2B2233",
          textAlign: "center",
          maxWidth: 1400,
          opacity,
          background: "#F7F0E1",
          padding: "6px 30px 10px",
          borderRadius: 3,
          transform: `rotate(-0.7deg) scale(${scale})`,
          boxShadow: "6px 8px 0 rgba(43,34,51,.35)",
        }}
      >
        {cap.text}
      </div>
    </AbsoluteFill>
  );
};

export const Ethics: React.FC<{ scene?: string; step?: number }> = ({ scene = "ethics", step = 1 }) => {
  const hasMusic = getStaticFiles().some((f) => f.name === MUSIC_FILE);

  return (
    <AbsoluteFill>
      <ImageSequence scene={scene} step={step} />
      <Captions />
      {timeline.lines.map((l) => (
        <Sequence key={l.n} from={l.startFrame} durationInFrames={l.durFrames} layout="none">
          <Audio src={staticFile(l.file)} />
        </Sequence>
      ))}
      <Audio src={staticFile("audio/sfx/roomtone.wav")} volume={roomVolume} loop />
      {timeline.typing.map(([from, to]) => (
        <Sequence key={from} from={from} durationInFrames={to - from} layout="none">
          <Audio src={staticFile("audio/sfx/typing.wav")} volume={TYPING_GAIN} loop />
        </Sequence>
      ))}
      {timeline.sfx.map((s, i) => (
        <Sequence key={i} from={s.frame} durationInFrames={s.durFrames} layout="none">
          <Audio src={staticFile(s.file)} volume={dB(s.gainDb)} />
        </Sequence>
      ))}
      {hasMusic ? <Audio src={staticFile(MUSIC_FILE)} volume={musicVolume} loop /> : null}
    </AbsoluteFill>
  );
};
