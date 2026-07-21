import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Text } from '@shared/ui';
import { haptics } from '@shared/lib/haptics';
import { runSeed } from '../lib/runSeed';

/**
 * Demo ma'lumotni yozadigan tugma — skrinshot/demo video tayyorlash uchun.
 * `__DEV__` bo'lmasa `null` qaytaradi, ya'ni release build'да umuman yo'q.
 */
export function DevSeedButton() {
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');

  if (!__DEV__) return null;

  const label = state === 'busy' ? 'Yozilmoqda…' : state === 'done' ? 'Demo ma\'lumot yozildi ✓' : 'Demo ma\'lumot yozish (dev)';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={state === 'busy'}
      onPress={async () => {
        setState('busy');
        try {
          await runSeed();
          haptics.success();
          setState('done');
        } catch {
          setState('idle');
        }
      }}
      style={styles.btn}
    >
      <Text style={styles.txt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  btn: {
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
  },
  txt: { fontSize: 12, color: theme.colors.textDim, fontFamily: theme.fontFamily.semibold },
}));
