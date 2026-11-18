import {createContext, useContext} from 'react';
import type {CSSProperties, FC, ReactNode} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {COLORS, FONT} from './theme';

export const TRANSITION = 15;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Each scene's animations were designed for a shorter cut and are slowed down by
// this factor so they line up with the narration.
export const SceneStretch = createContext(1);

export const useSceneFrame = () => useCurrentFrame() / useContext(SceneStretch);

// Moving gradient blobs and a drifting grid behind every scene.
export const Background: FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 35%, ${COLORS.bg2}, ${COLORS.bg} 70%)`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: COLORS.oltp,
          opacity: 0.13,
          filter: 'blur(170px)',
          left: -100 + Math.sin(t * 0.5) * 140,
          top: -150 + Math.cos(t * 0.4) * 90,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: COLORS.olap,
          opacity: 0.15,
          filter: 'blur(170px)',
          right: -150 + Math.cos(t * 0.45) * 140,
          bottom: -250 + Math.sin(t * 0.35) * 90,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          backgroundPosition: `${frame * 0.4}px ${frame * 0.4}px`,
        }}
      />
    </AbsoluteFill>
  );
};

// Slides, scales and un-blurs a scene in, then pushes it out to the left.
export const SceneFrame: FC<{duration: number; children: ReactNode}> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 200}, durationInFrames: TRANSITION + 5});
  const exit = interpolate(frame, [duration - TRANSITION, duration], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const x = (1 - enter) * 160 - exit * 160;
  const scale = 0.96 + 0.04 * enter - 0.04 * exit;
  const blur = (1 - enter) * 10 + exit * 10;
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(enter, 1 - exit),
        transform: `translateX(${x}px) scale(${scale})`,
        filter: `blur(${blur}px)`,
        fontFamily: FONT,
        color: COLORS.text,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// A soft light band that sweeps across the frame at scene changes.
export const Sweep: FC = () => {
  const frame = useCurrentFrame();
  const left = interpolate(frame, [0, 30], [-800, 2400], {
    ...clamp,
    easing: Easing.inOut(Easing.quad),
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          top: -200,
          bottom: -200,
          left,
          width: 520,
          transform: 'skewX(-20deg)',
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent)',
        }}
      />
    </AbsoluteFill>
  );
};

// Fades and lifts its children in after `delay` frames.
export const RiseIn: FC<{delay?: number; style?: CSSProperties; children: ReactNode}> = ({
  delay = 0,
  style,
  children,
}) => {
  const frame = useSceneFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 18, mass: 0.6}});
  return (
    <div style={{opacity: p, transform: `translateY(${(1 - p) * 40}px)`, ...style}}>
      {children}
    </div>
  );
};

// Pops its children in with a slight overshoot.
export const PopIn: FC<{delay?: number; style?: CSSProperties; children: ReactNode}> = ({
  delay = 0,
  style,
  children,
}) => {
  const frame = useSceneFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 11, mass: 0.7}});
  return (
    <div style={{opacity: Math.min(1, p), transform: `scale(${p})`, ...style}}>
      {children}
    </div>
  );
};

export const Pill: FC<{color: string; children: ReactNode}> = ({color, children}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 20px',
      borderRadius: 999,
      border: `2px solid ${color}`,
      background: `${color}22`,
      color,
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: 2,
    }}
  >
    {children}
  </div>
);

export const IconBadge: FC<{color: string; size?: number; children: ReactNode}> = ({
  color,
  size = 120,
  children,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `${color}1F`,
      border: `2px solid ${color}88`,
      boxShadow: `0 0 40px ${color}44`,
    }}
  >
    {children}
  </div>
);

export const Card: FC<{style?: CSSProperties; children: ReactNode}> = ({style, children}) => (
  <div
    style={{
      background: COLORS.card,
      border: `1.5px solid ${COLORS.border}`,
      borderRadius: 28,
      backdropFilter: 'blur(8px)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Bullet: FC<{color: string; icon: ReactNode; delay: number; children: ReactNode}> = ({
  color,
  icon,
  delay,
  children,
}) => (
  <RiseIn delay={delay}>
    <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 26}}>
      <IconBadge color={color} size={72}>
        {icon}
      </IconBadge>
      <div style={{fontSize: 36, fontWeight: 500, color: COLORS.text}}>{children}</div>
    </div>
  </RiseIn>
);

export const ProgressBar: FC<{total: number}> = ({total}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: 8,
        width: `${(frame / total) * 100}%`,
        background: `linear-gradient(90deg, ${COLORS.oltp}, ${COLORS.etl}, ${COLORS.olap})`,
      }}
    />
  );
};
