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

export const ChevronLeftIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M15 6l-6 6 6 6" />
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

export {
  HabitIcon,
  HABIT_ICONS,
  HABIT_ICON_KEYS,
  type HabitIconKey,
} from './habitIcons';
