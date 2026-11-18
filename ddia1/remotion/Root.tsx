import type {FC} from 'react';
import {Composition} from 'remotion';
import {OperationalVsAnalytical, TOTAL_FRAMES} from './OperationalVsAnalytical';
import {FPS, HEIGHT, WIDTH} from './theme';

export const RemotionRoot: FC = () => (
  <Composition
    id="OperationalVsAnalytical"
    component={OperationalVsAnalytical}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
