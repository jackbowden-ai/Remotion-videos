import type {FC} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Background, ProgressBar, SceneFrame, SceneStretch, Sweep, TRANSITION} from './components';
import {CompareScene, EtlScene, OlapScene, OltpScene, OutroScene, TitleScene} from './scenes';
import cues from './voiceover/cues.json';

// Frames where each scene cuts in, at 30fps. The scene animations were designed
// against the original 30s cuts and get stretched to fit the narration.
const ORIGINAL_CUTS = cues.oldSceneCuts;
const CUTS = cues.newSceneCuts;

const SCENES: {name: string; Component: FC}[] = [
  {name: 'Title', Component: TitleScene},
  {name: 'Operational', Component: OltpScene},
  {name: 'Analytical', Component: OlapScene},
  {name: 'ETL', Component: EtlScene},
  {name: 'Comparison', Component: CompareScene},
  {name: 'Takeaway', Component: OutroScene},
];

export const TOTAL_FRAMES = CUTS[CUTS.length - 1];

const MUSIC_VOLUME = 0.15;

const Soundtrack: FC = () => (
  <>
    <Audio src={staticFile('voiceover/music/music-bed.wav')} volume={MUSIC_VOLUME} />
    {cues.scenes.map((s) => (
      <Sequence key={s.narration} name={`Voice: ${s.scene}`} from={s.narrationStartFrame}>
        <Audio src={staticFile(`voiceover/${s.narration}`)} />
      </Sequence>
    ))}
    {cues.sfx.flatMap(({file, frames, volume}) =>
      frames.map((frame) => (
        <Sequence key={`${file}-${frame}`} name={`SFX: ${file}`} from={frame}>
          <Audio src={staticFile(`voiceover/${file}`)} volume={volume} />
        </Sequence>
      )),
    )}
  </>
);

export const OperationalVsAnalytical: FC = () => (
  <AbsoluteFill>
    <Background />
    {SCENES.map(({name, Component}, i) => {
      const isLast = i === SCENES.length - 1;
      const length = CUTS[i + 1] - CUTS[i] + (isLast ? 0 : TRANSITION);
      const stretch = (CUTS[i + 1] - CUTS[i]) / (ORIGINAL_CUTS[i + 1] - ORIGINAL_CUTS[i]);
      return (
        <Sequence key={name} name={name} from={CUTS[i]} durationInFrames={length}>
          <SceneStretch.Provider value={stretch}>
            <SceneFrame duration={length}>
              <Component />
            </SceneFrame>
          </SceneStretch.Provider>
        </Sequence>
      );
    })}
    {CUTS.slice(1, -1).map((cut) => (
      <Sequence key={`sweep-${cut}`} name="Sweep" from={cut - 10} durationInFrames={30}>
        <Sweep />
      </Sequence>
    ))}
    <ProgressBar total={TOTAL_FRAMES} />
    <Soundtrack />
  </AbsoluteFill>
);
