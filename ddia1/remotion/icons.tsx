import type {FC, ReactNode} from 'react';

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const Svg: FC<IconProps & {children: ReactNode}> = ({
  size = 48,
  color = 'currentColor',
  strokeWidth = 1.8,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const DatabaseIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
  </Svg>
);

export const WarehouseIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 21V9l9-6 9 6v12" />
    <path d="M7 21v-8h10v8" />
    <path d="M7 17h10" />
  </Svg>
);

export const UserIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </Svg>
);

export const CartIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.5 12h11.5l2-8H6.2" />
  </Svg>
);

export const PhoneIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="2" width="12" height="20" rx="2.5" />
    <path d="M11 18h2" />
  </Svg>
);

export const ChartIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 3v18h18" />
    <rect x="7" y="12" width="3" height="6" />
    <rect x="12" y="8" width="3" height="10" />
    <rect x="17" y="5" width="3" height="13" />
  </Svg>
);

export const BoltIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </Svg>
);

export const ClockIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const LayersIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
  </Svg>
);

export const GearIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
  </Svg>
);

export const ExtractIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 14v6h16v-6" />
    <path d="M12 3v12M7 8l5-5 5 5" />
  </Svg>
);

export const LoadIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 14v6h16v-6" />
    <path d="M12 3v12M7 10l5 5 5-5" />
  </Svg>
);

export const ArrowRightIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Svg>
);
