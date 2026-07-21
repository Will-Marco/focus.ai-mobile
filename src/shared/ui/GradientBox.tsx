import React from 'react';
import { StyleSheet as RNStyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export interface GradientBoxProps {
  colors: readonly string[];
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

/**
 * Gradient fonli konteyner — o'lchamni farzandlar belgilaydi.
 *
 * NEGA KERAK: `react-native-linear-gradient` (2.8.3) Fabric komponentiga ega emas,
 * shuning uchun New Arch'да interop qatlami orqali ishlaydi. iOS'да bu qatlam
 * gradient view'ning **intrinsic** o'lchamini farzandlaridan hisoblay olmaydi —
 * natijada kontent kesiladi (banner matni, sheet kengligi). Android'да interop
 * boshqacha, shuning uchun u yerda ko'rinmaydi.
 *
 * YECHIM: o'lchamni oddiy `View` belgilaydi (u layout'ni to'g'ri hisoblaydi),
 * gradient esa uning ichida absolute fon qatlami bo'lib qoladi — layout'ga
 * umuman ta'sir qilmaydi. `overflow: hidden` gradientni borderRadius bo'yicha kesadi.
 *
 * ⚠️ Qat'iy o'lchamli (width/height berilgan) gradientlar — Fab, Avatar, Button —
 * to'g'ri ishlaydi, ularni o'zgartirish shart emas.
 */
export function GradientBox({ colors, children, style, start = { x: 0, y: 0 }, end = { x: 1, y: 1 } }: GradientBoxProps) {
  return (
    <View style={[style, styles.clip]}>
      <LinearGradient colors={[...colors]} start={start} end={end} style={RNStyleSheet.absoluteFill} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = RNStyleSheet.create({
  clip: { overflow: 'hidden' },
});
