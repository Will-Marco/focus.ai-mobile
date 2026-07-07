import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const Stroke = ({
  size = 22,
  color = '#fff',
  strokeWidth = 2,
  children,
}: IconProps & { children: React.ReactNode }) => (
  <Svg
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
  </Svg>
);

export const HomeIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M3 10.5 12 3l9 7.5" />
    <Path d="M5 9.5V21h14V9.5" />
  </Stroke>
);

export const StatsIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Stroke>
);

export const TeamIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Circle cx="9" cy="8" r="3" />
    <Circle cx="17" cy="9" r="2.4" />
    <Path d="M3 19c0-3 3-5 6-5s6 2 6 5M15.5 19c0-2 1.5-3.5 3.5-3.5s2.5 1 2.5 3" />
  </Stroke>
);

export const ProfileIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Circle cx="12" cy="8" r="3.4" />
    <Path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
  </Stroke>
);

export const PlusIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M12 5v14M5 12h14" />
  </Stroke>
);

export const BellIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.7 21a2 2 0 01-3.4 0" />
  </Stroke>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M15 6l-6 6 6 6" />
  </Stroke>
);

export const PhoneIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1v3.6c0 .6-.4 1-1 1C10.7 21.1 3 13.4 3 3.9c0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z" />
  </Stroke>
);

export const PlayIcon = ({ size = 22, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M7 5l12 7-12 7z" />
  </Svg>
);

// Konsentrik doiralar — Focus AI logotipi (Auth) va "nishon" mazmuni.
export const TargetIcon = ({ size = 24, color = '#fff', strokeWidth = 2.4 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}>
    <Circle cx="12" cy="12" r="9" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

// To'ldirilgan alanga — streak indikatori (Statistika).
export const FlameIcon = ({ size = 16, color = '#F2603E' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2c1 3-1 4.5-2 6.5s.5 4 2.5 4 3-2.5 1.5-5.5c2.5 1.5 4 4.5 4 7.5a6 6 0 11-12 0c0-3 2-5.5 3-7.5 1-2 1-3 0-5z" />
  </Svg>
);

// To'ldirilgan 4-uchli yulduzcha — AI Murabbiy orb belgisi.
export const SparkleIcon = ({ size = 18, color = '#1f140b' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" />
  </Svg>
);

export const PauseIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M8 5v14M16 5v14" />
  </Stroke>
);

export const CheckIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M5 13l4 4L19 7" />
  </Stroke>
);

export const TrashIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Stroke>
);

export const EyeIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <Circle cx={12} cy={12} r={3} />
  </Stroke>
);

export const EyeOffIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M3 3l18 18M10.6 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.2M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7c1.4 0 2.6-.3 3.7-.8M9.5 9.7a3 3 0 0 0 4.2 4.2" />
  </Stroke>
);

export {
  HabitIcon,
  HABIT_ICONS,
  HABIT_ICON_KEYS,
  type HabitIconKey,
} from './habitIcons';
