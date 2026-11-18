import type {FC, ReactNode} from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {Bullet, Card, IconBadge, PopIn, Pill, RiseIn, useSceneFrame} from './components';
import {
  ArrowRightIcon,
  BoltIcon,
  CartIcon,
  ChartIcon,
  ClockIcon,
  DatabaseIcon,
  ExtractIcon,
  GearIcon,
  LayersIcon,
  LoadIcon,
  PhoneIcon,
  UserIcon,
  WarehouseIcon,
} from './icons';
import {COLORS, MONO} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const SceneHeader: FC<{tag: string; color: string; title: string; subtitle: string}> = ({
  tag,
  color,
  title,
  subtitle,
}) => (
  <div style={{position: 'absolute', left: 140, top: 110}}>
    <RiseIn delay={0}>
      <Pill color={color}>{tag}</Pill>
    </RiseIn>
    <RiseIn delay={5}>
      <div style={{fontSize: 84, fontWeight: 800, marginTop: 22, letterSpacing: -1.5}}>{title}</div>
    </RiseIn>
    <RiseIn delay={10}>
      <div style={{fontSize: 34, color: COLORS.muted, marginTop: 6}}>{subtitle}</div>
    </RiseIn>
  </div>
);

// ---------------------------------------------------------------- 1. Title

export const TitleScene: FC = () => {
  const frame = useSceneFrame();
  const {fps} = useVideoConfig();
  const vs = spring({frame: frame - 14, fps, config: {damping: 9}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <RiseIn delay={0}>
        <div style={{fontSize: 28, letterSpacing: 6, color: COLORS.muted, fontWeight: 600, textAlign: 'center'}}>
          DESIGNING DATA-INTENSIVE APPLICATIONS Â· CHAPTER 1
        </div>
      </RiseIn>
      <div style={{display: 'flex', alignItems: 'center', gap: 70, marginTop: 60}}>
        <PopIn delay={6}>
          <IconBadge color={COLORS.oltp} size={210}>
            <DatabaseIcon size={120} color={COLORS.oltp} />
          </IconBadge>
        </PopIn>
        <div style={{fontSize: 64, fontWeight: 800, color: COLORS.muted, transform: `scale(${vs})`}}>vs</div>
        <PopIn delay={10}>
          <IconBadge color={COLORS.olap} size={210}>
            <WarehouseIcon size={120} color={COLORS.olap} />
          </IconBadge>
        </PopIn>
      </div>
      <RiseIn delay={16} style={{marginTop: 60}}>
        <div style={{fontSize: 104, fontWeight: 800, letterSpacing: -2, textAlign: 'center'}}>
          <span style={{color: COLORS.oltp}}>Operational</span>
          <span style={{color: COLORS.muted}}> vs </span>
          <span style={{color: COLORS.olap}}>Analytical</span>
        </div>
      </RiseIn>
      <RiseIn delay={24}>
        <div style={{fontSize: 40, color: COLORS.muted, marginTop: 14, textAlign: 'center'}}>
          Two kinds of data systems, built for very different jobs
        </div>
      </RiseIn>
    </AbsoluteFill>
  );
};

// ------------------------------------------------- 2. Operational (OLTP)

const OLTP_LANES = [
  {y: 80, label: 'GET user:42', icon: <PhoneIcon size={48} color={COLORS.text} />},
  {y: 210, label: 'INSERT order', icon: <CartIcon size={48} color={COLORS.text} />},
  {y: 340, label: 'UPDATE cart', icon: <UserIcon size={48} color={COLORS.text} />},
];

export const OltpScene: FC = () => {
  const frame = useSceneFrame();
  const dbX = 650;
  const dbY = 210;
  const pulse = 1 + 0.06 * Math.max(0, Math.sin(frame / 4));
  return (
    <AbsoluteFill>
      <SceneHeader
        tag="OLTP"
        color={COLORS.oltp}
        title="Operational systems"
        subtitle="Online Transaction Processing: the backend of your app"
      />
      <div style={{position: 'absolute', left: 140, top: 470, width: 800}}>
        <Bullet color={COLORS.oltp} delay={22} icon={<UserIcon size={38} color={COLORS.oltp} />}>
          Serves users of the app, live
        </Bullet>
        <Bullet color={COLORS.oltp} delay={32} icon={<BoltIcon size={38} color={COLORS.oltp} />}>
          Fast reads &amp; writes of a few rows by key
        </Bullet>
        <Bullet color={COLORS.oltp} delay={42} icon={<ClockIcon size={38} color={COLORS.oltp} />}>
          Holds the latest state of the data
        </Bullet>
      </div>

      <RiseIn delay={12} style={{position: 'absolute', left: 1010, top: 330}}>
        <Card style={{width: 780, height: 440, position: 'relative'}}>
          <svg width={780} height={440} style={{position: 'absolute', inset: 0}}>
            {OLTP_LANES.map((lane, i) => {
              const x1 = 310;
              const x2 = dbX - 80;
              const period = 42;
              const p = (((frame - 20 + i * 14) % period) + period) % period / period;
              const visible = frame > 20 + i * 4;
              return (
                <g key={lane.label}>
                  <line x1={x1} y1={lane.y} x2={x2} y2={dbY} stroke={COLORS.border} strokeWidth={3} strokeDasharray="8 10" />
                  {visible ? (
                    <circle
                      cx={x1 + (x2 - x1) * p}
                      cy={lane.y + (dbY - lane.y) * p}
                      r={10}
                      fill={COLORS.oltp}
                      opacity={interpolate(p, [0, 0.1, 0.85, 1], [0, 1, 1, 0])}
                      style={{filter: `drop-shadow(0 0 8px ${COLORS.oltp})`}}
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>
          {OLTP_LANES.map((lane, i) => (
            <PopIn key={lane.label} delay={16 + i * 5} style={{position: 'absolute', left: 30, top: lane.y - 40}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <IconBadge color={COLORS.muted} size={80}>
                  {lane.icon}
                </IconBadge>
                <div style={{fontFamily: MONO, fontSize: 22, color: COLORS.oltp}}>{lane.label}</div>
              </div>
            </PopIn>
          ))}
          <PopIn delay={20} style={{position: 'absolute', left: dbX - 80, top: dbY - 80}}>
            <div style={{transform: `scale(${pulse})`}}>
              <IconBadge color={COLORS.oltp} size={160}>
                <DatabaseIcon size={92} color={COLORS.oltp} />
              </IconBadge>
            </div>
          </PopIn>
        </Card>
      </RiseIn>
    </AbsoluteFill>
  );
};

// ------------------------------------------------- 3. Analytical (OLAP)

const ROWS = 12;
const COLS = 5;
const BARS = [0.45, 0.8, 0.6, 0.95];

export const OlapScene: FC = () => {
  const frame = useSceneFrame();
  const {fps} = useVideoConfig();
  const scan = interpolate(frame, [22, 110], [0, ROWS], clamp);
  return (
    <AbsoluteFill>
      <SceneHeader
        tag="OLAP"
        color={COLORS.olap}
        title="Analytical systems"
        subtitle="Online Analytic Processing: answers business questions"
      />
      <div style={{position: 'absolute', left: 140, top: 470, width: 800}}>
        <Bullet color={COLORS.olap} delay={22} icon={<ChartIcon size={38} color={COLORS.olap} />}>
          Used by analysts for reports &amp; dashboards
        </Bullet>
        <Bullet color={COLORS.olap} delay={32} icon={<LayersIcon size={38} color={COLORS.olap} />}>
          Scans millions of rows, then aggregates
        </Bullet>
        <Bullet color={COLORS.olap} delay={42} icon={<ClockIcon size={38} color={COLORS.olap} />}>
          Keeps the history of events over time
        </Bullet>
      </div>

      <RiseIn delay={12} style={{position: 'absolute', left: 1010, top: 330}}>
        <Card style={{width: 780, height: 440, position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 36, top: 28, display: 'flex', alignItems: 'center', gap: 12, color: COLORS.olap, fontSize: 24, fontWeight: 700}}>
            <WarehouseIcon size={34} color={COLORS.olap} /> Data warehouse
          </div>
          {/* Table being scanned row by row */}
          <div style={{position: 'absolute', left: 36, top: 84}}>
            {Array.from({length: ROWS}).map((_, r) => {
              const lit = interpolate(scan - r, [0, 1], [0.15, 0.7], clamp);
              return (
                <div key={r} style={{display: 'flex', gap: 6, marginBottom: 6}}>
                  {Array.from({length: COLS}).map((__, c) => (
                    <div key={c} style={{width: 56, height: 16, borderRadius: 4, background: COLORS.olap, opacity: lit}} />
                  ))}
                </div>
              );
            })}
            <div
              style={{
                position: 'absolute',
                left: -8,
                width: 320,
                height: 6,
                top: Math.min(scan, ROWS) * 22 - 6,
                background: COLORS.text,
                borderRadius: 3,
                boxShadow: `0 0 20px ${COLORS.olap}`,
                opacity: scan > 0 && scan < ROWS ? 1 : 0,
              }}
            />
          </div>
          <div style={{position: 'absolute', left: 372, top: 190}}>
            <ArrowRightIcon size={52} color={COLORS.muted} />
          </div>
          {/* Aggregated result */}
          <div style={{position: 'absolute', left: 450, top: 84, width: 290, height: 264, display: 'flex', alignItems: 'flex-end', gap: 22, borderLeft: `3px solid ${COLORS.border}`, borderBottom: `3px solid ${COLORS.border}`, padding: '0 0 0 22px'}}>
            {BARS.map((h, i) => {
              const grow = spring({frame: frame - 60 - i * 8, fps, config: {damping: 14}});
              return (
                <div
                  key={i}
                  style={{
                    width: 46,
                    height: h * 240 * grow,
                    borderRadius: '8px 8px 0 0',
                    background: `linear-gradient(180deg, ${COLORS.olap}, ${COLORS.olap}55)`,
                  }}
                />
              );
            })}
          </div>
          <div style={{position: 'absolute', left: 36, bottom: 26, fontFamily: MONO, fontSize: 22, color: COLORS.muted}}>
            SELECT region, <span style={{color: COLORS.olap}}>SUM</span>(revenue) â€¦ GROUP BY region
          </div>
        </Card>
      </RiseIn>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- 4. ETL

const SOURCES = [
  {y: 420, label: 'Orders'},
  {y: 590, label: 'Inventory'},
  {y: 760, label: 'Users'},
];
const STAGES: {x: number; label: string; icon: ReactNode}[] = [
  {x: 680, label: 'Extract', icon: <ExtractIcon size={64} color={COLORS.etl} />},
  {x: 980, label: 'Transform', icon: <GearIcon size={64} color={COLORS.etl} />},
  {x: 1280, label: 'Load', icon: <LoadIcon size={64} color={COLORS.etl} />},
];
const MAIN_Y = 590;
const SRC_X = 300;
const WH_X = 1640;

export const EtlScene: FC = () => {
  const frame = useSceneFrame();
  const draw = interpolate(frame, [10, 50], [1, 0], clamp);
  const flowing = frame > 45;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 140, top: 110}}>
        <RiseIn>
          <Pill color={COLORS.etl}>ETL</Pill>
        </RiseIn>
        <RiseIn delay={5}>
          <div style={{fontSize: 84, fontWeight: 800, marginTop: 22, letterSpacing: -1.5}}>
            Moving data between them
          </div>
        </RiseIn>
      </div>

      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {SOURCES.map((s) => (
          <line
            key={s.label}
            x1={SRC_X + 50}
            y1={s.y}
            x2={STAGES[0].x - 100}
            y2={MAIN_Y}
            stroke={COLORS.oltp}
            strokeOpacity={0.5}
            strokeWidth={4}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={draw}
          />
        ))}
        <line
          x1={STAGES[0].x - 100}
          y1={MAIN_Y}
          x2={WH_X - 120}
          y2={MAIN_Y}
          stroke={COLORS.etl}
          strokeOpacity={0.5}
          strokeWidth={4}
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={draw}
        />
        {flowing
          ? SOURCES.map((s, i) => {
              const p = ((frame - 45 + i * 9) % 36) / 36;
              const x1 = SRC_X + 50;
              const x2 = STAGES[0].x - 100;
              return (
                <circle key={s.label} cx={x1 + (x2 - x1) * p} cy={s.y + (MAIN_Y - s.y) * p} r={9} fill={COLORS.oltp} />
              );
            })
          : null}
        {flowing
          ? Array.from({length: 6}).map((_, i) => {
              const start = STAGES[0].x - 100;
              const end = WH_X - 120;
              const p = ((frame - 45 + i * 12) % 72) / 72;
              const x = start + (end - start) * p;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={MAIN_Y}
                  r={10}
                  fill={x < STAGES[1].x ? COLORS.oltp : COLORS.olap}
                  style={{filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))'}}
                />
              );
            })
          : null}
      </svg>

      {SOURCES.map((s, i) => (
        <PopIn key={s.label} delay={8 + i * 4} style={{position: 'absolute', left: SRC_X - 186, top: s.y - 50, display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{fontSize: 24, color: COLORS.muted, width: 120, textAlign: 'right'}}>{s.label}</div>
          <IconBadge color={COLORS.oltp} size={100}>
            <DatabaseIcon size={58} color={COLORS.oltp} />
          </IconBadge>
        </PopIn>
      ))}

      {STAGES.map((st, i) => (
        <PopIn key={st.label} delay={20 + i * 7} style={{position: 'absolute', left: st.x - 100, top: MAIN_Y - 90}}>
          <Card
            style={{
              width: 200,
              height: 180,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              background: COLORS.bg2,
              border: `2px solid ${COLORS.etl}99`,
              boxShadow: `0 0 40px ${COLORS.etl}33`,
            }}
          >
            <div style={{transform: st.label === 'Transform' ? `rotate(${frame * 3}deg)` : undefined}}>{st.icon}</div>
            <div style={{fontSize: 30, fontWeight: 700, color: COLORS.etl}}>{st.label}</div>
          </Card>
        </PopIn>
      ))}

      <PopIn delay={42} style={{position: 'absolute', left: WH_X - 120, top: MAIN_Y - 120}}>
        <IconBadge color={COLORS.olap} size={240}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            <WarehouseIcon size={110} color={COLORS.olap} />
            <div style={{fontSize: 26, fontWeight: 700, color: COLORS.olap}}>Warehouse</div>
          </div>
        </IconBadge>
      </PopIn>

      <RiseIn delay={55} style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center'}}>
        <div style={{fontSize: 38, color: COLORS.muted}}>
          Copy data out periodically, so heavy analytics <span style={{color: COLORS.text, fontWeight: 700}}>never slows down the live app</span>
        </div>
      </RiseIn>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------ 5. Comparison

const ROWS_TABLE: [string, string, string][] = [
  ['Who uses it', 'Customers, via the app', 'Analysts & managers'],
  ['Reads', 'A few rows, looked up by key', 'Aggregates over huge numbers of rows'],
  ['Writes', 'Small, frequent, from user input', 'Bulk import (ETL) or event stream'],
  ['Data shows', 'The latest state, right now', 'History of what happened over time'],
  ['Typical size', 'Gigabytes to terabytes', 'Terabytes to petabytes'],
];

export const CompareScene: FC = () => (
  <AbsoluteFill>
    <div style={{position: 'absolute', left: 140, top: 90}}>
      <RiseIn>
        <div style={{fontSize: 84, fontWeight: 800, letterSpacing: -1.5}}>At a glance</div>
      </RiseIn>
    </div>
    <div style={{position: 'absolute', left: 140, right: 140, top: 250}}>
      <RiseIn delay={4}>
        <div style={{display: 'grid', gridTemplateColumns: '300px 1fr 1fr', gap: 20, marginBottom: 18}}>
          <div />
          <div style={{display: 'flex', alignItems: 'center', gap: 16, fontSize: 38, fontWeight: 800, color: COLORS.oltp}}>
            <DatabaseIcon size={48} color={COLORS.oltp} /> Operational
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, fontSize: 38, fontWeight: 800, color: COLORS.olap}}>
            <WarehouseIcon size={48} color={COLORS.olap} /> Analytical
          </div>
        </div>
      </RiseIn>
      {ROWS_TABLE.map(([label, op, an], i) => (
        <RiseIn key={label} delay={12 + i * 8}>
          <Card style={{display: 'grid', gridTemplateColumns: '300px 1fr 1fr', gap: 20, padding: '24px 32px', marginBottom: 16, borderRadius: 20, alignItems: 'center'}}>
            <div style={{fontSize: 28, fontWeight: 700, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 2}}>{label}</div>
            <div style={{fontSize: 32, borderLeft: `4px solid ${COLORS.oltp}`, paddingLeft: 20}}>{op}</div>
            <div style={{fontSize: 32, borderLeft: `4px solid ${COLORS.olap}`, paddingLeft: 20}}>{an}</div>
          </Card>
        </RiseIn>
      ))}
    </div>
  </AbsoluteFill>
);

// --------------------------------------------------------- 6. Takeaway

export const OutroScene: FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
      <PopIn delay={0}>
        <IconBadge color={COLORS.oltp} size={140}>
          <DatabaseIcon size={80} color={COLORS.oltp} />
        </IconBadge>
      </PopIn>
      <PopIn delay={6}>
        <ArrowRightIcon size={70} color={COLORS.etl} />
      </PopIn>
      <PopIn delay={12}>
        <IconBadge color={COLORS.olap} size={140}>
          <WarehouseIcon size={80} color={COLORS.olap} />
        </IconBadge>
      </PopIn>
    </div>
    <RiseIn delay={10} style={{marginTop: 60}}>
      <div style={{fontSize: 80, fontWeight: 800, letterSpacing: -1.5}}>
        Keep <span style={{color: COLORS.oltp}}>transactions</span> fast.
      </div>
    </RiseIn>
    <RiseIn delay={18}>
      <div style={{fontSize: 80, fontWeight: 800, letterSpacing: -1.5}}>
        Run <span style={{color: COLORS.olap}}>analytics</span> somewhere else.
      </div>
    </RiseIn>
    <RiseIn delay={28} style={{marginTop: 36}}>
      <div style={{fontSize: 30, color: COLORS.muted, letterSpacing: 4}}>DDIA Â· CHAPTER 1</div>
    </RiseIn>
  </AbsoluteFill>
);
