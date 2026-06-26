import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { IconProps } from './index';

// Habit ikonka to'plami (lucide-uslub stroke). Habit.icon = quyidagi key'lardan biri.
const Base = ({
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

const book = (p: IconProps) => (
  <Base {...p}>
    <Path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z" />
    <Path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20" />
  </Base>
);
const dumbbell = (p: IconProps) => (
  <Base {...p}>
    <Path d="M6.5 6.5v11M3 9v6M17.5 6.5v11M21 9v6M6.5 12h11" />
  </Base>
);
const code = (p: IconProps) => (
  <Base {...p}>
    <Path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13 5l-2 14" />
  </Base>
);
const leaf = (p: IconProps) => (
  <Base {...p}>
    <Path d="M4 20c0-9 7-14 16-14 0 9-5 16-14 16-2 0-2-2-2-2z" />
    <Path d="M4 20c4-6 8-9 12-10" />
  </Base>
);
const pen = (p: IconProps) => (
  <Base {...p}>
    <Path d="M14 4l6 6L8 22H2v-6z" />
    <Path d="M12 6l6 6" />
  </Base>
);
const heart = (p: IconProps) => (
  <Base {...p}>
    <Path d="M12 21C5 16 3 12 3 8.5 3 6 5 4 7.5 4 9.5 4 11 5.2 12 7c1-1.8 2.5-3 4.5-3C19 4 21 6 21 8.5 21 12 19 16 12 21z" />
  </Base>
);
const music = (p: IconProps) => (
  <Base {...p}>
    <Path d="M9 18V5l11-2v13" />
    <Circle cx="6" cy="18" r="3" />
    <Circle cx="17" cy="16" r="3" />
  </Base>
);
const target = (p: IconProps) => (
  <Base {...p}>
    <Circle cx="12" cy="12" r="9" />
    <Circle cx="12" cy="12" r="5" />
    <Circle cx="12" cy="12" r="1.4" />
  </Base>
);
const brain = (p: IconProps) => (
  <Base {...p}>
    <Path d="M12 5a3 3 0 0 0-5.5-1.5A3 3 0 0 0 4 8c0 1 .5 2 1.5 2.5C5 12 5 14 6.5 15c.5 2 2.5 3 4 2.5 .5.5 1 .5 1.5.5z" />
    <Path d="M12 5a3 3 0 0 1 5.5-1.5A3 3 0 0 1 20 8c0 1-.5 2-1.5 2.5C19 12 19 14 17.5 15c-.5 2-2.5 3-4 2.5-.5.5-1 .5-1.5.5z" />
  </Base>
);
const sun = (p: IconProps) => (
  <Base {...p}>
    <Circle cx="12" cy="12" r="4" />
    <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
  </Base>
);

export const HABIT_ICONS = {
  book,
  dumbbell,
  code,
  leaf,
  pen,
  heart,
  music,
  target,
  brain,
  sun,
} as const;

export type HabitIconKey = keyof typeof HABIT_ICONS;

export const HABIT_ICON_KEYS = Object.keys(HABIT_ICONS) as HabitIconKey[];

// Nom bo'yicha habit ikonka (noma'lum bo'lsa target fallback).
export function HabitIcon({ name, ...props }: IconProps & { name: string }) {
  const Comp = HABIT_ICONS[name as HabitIconKey] ?? target;
  return <Comp {...props} />;
}
