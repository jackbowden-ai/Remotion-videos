import { Composition } from "remotion";
import {
  COMP_NAME,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { Main } from "./MyComp/Main";
import { NextLogo } from "./MyComp/NextLogo";
import { ImageSequence } from "./ImageSequence";
import { Ethics } from "./Ethics";
import timeline from "./ethics-timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Ethics"
        component={Ethics}
        durationInFrames={timeline.durationInFrames}
        fps={timeline.fps}
        width={1920}
        height={1080}
      />
      <Composition
        id="EthicsV3Draft"
        component={Ethics}
        durationInFrames={timeline.durationInFrames}
        fps={timeline.fps}
        width={1920}
        height={1080}
        defaultProps={{ scene: "ethics-v3-draft", step: 1 }}
      />
      <Composition
        id="Demo"
        component={ImageSequence}
        durationInFrames={264}
        fps={24}
        width={1920}
        height={1080}
        defaultProps={{ scene: "demo" }}
      />
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id="NextLogo"
        component={NextLogo}
        durationInFrames={300}
        fps={30}
        width={140}
        height={140}
        defaultProps={{
          outProgress: 0,
        }}
      />
    </>
  );
};
