import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import {
  Button,
  HabitIcon,
  HABIT_ICON_KEYS,
  Input,
  Text,
} from '@shared/ui';
import { HABIT_COLOR_KEYS, habitColorHex } from '@shared/theme';
import { haptics } from '@shared/lib/haptics';
import { useHabitStore, type Habit, type HabitPeriod } from '@entities/habit';
import { PERIOD_OPTIONS, TARGET_COUNT_BOUNDS } from '../config/options';
import { validateHabitDraft, type HabitFormErrors } from '../model/validate';

export interface CreateHabitFormProps {
  /** berilsa — tahrir rejimi. */
  initial?: Habit;
  onDone: () => void;
}

export function CreateHabitForm({ initial, onDone }: CreateHabitFormProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const addHabit = useHabitStore((s) => s.addHabit);
  const editHabit = useHabitStore((s) => s.editHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);

  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? HABIT_ICON_KEYS[0]);
  const [color, setColor] = useState<string>(initial?.color ?? HABIT_COLOR_KEYS[0]);
  const [period, setPeriod] = useState<HabitPeriod>(initial?.period ?? 'daily');
  const [targetCount, setTargetCount] = useState(
    initial?.targetCount ?? TARGET_COUNT_BOUNDS.daily.default,
  );
  const [errors, setErrors] = useState<HabitFormErrors>({});

  const bounds = TARGET_COUNT_BOUNDS[period];

  const onPeriodChange = (next: HabitPeriod) => {
    haptics.selection();
    setPeriod(next);
    // davr o'zgarsa mos default maqsadga o'tamiz (faqat yangi odat yaratishda).
    if (!initial) setTargetCount(TARGET_COUNT_BOUNDS[next].default);
  };

  const bump = (dir: 1 | -1) => {
    haptics.light();
    setTargetCount((c) => Math.max(bounds.min, Math.min(bounds.max, c + dir)));
  };

  const onSubmit = async () => {
    const res = validateHabitDraft({ name, icon, color, period, targetCount });
    if (!res.ok) {
      setErrors(res.errors);
      return;
    }
    if (initial) await editHabit(initial.id, res.draft);
    else await addHabit(res.draft);
    onDone();
  };

  const onDelete = async () => {
    if (!initial) return;
    await removeHabit(initial.id);
    onDone();
  };

  return (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label={t('addHabit.nameLabel')}
          placeholder={t('addHabit.namePlaceholder')}
          value={name}
          onChangeText={setName}
          maxLength={50}
        />
        {errors.name ? <Text style={styles.error}>{t('addHabit.errors.name')}</Text> : null}

        <Text style={styles.section}>{t('addHabit.icon')}</Text>
        <View style={styles.iconGrid}>
          {HABIT_ICON_KEYS.map((key) => {
            const active = key === icon;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  haptics.selection();
                  setIcon(key);
                }}
                style={[
                  styles.iconCell,
                  active && { borderColor: habitColorHex(color), backgroundColor: theme.colors.surfaceStrong },
                ]}
              >
                <HabitIcon
                  name={key}
                  size={24}
                  color={active ? habitColorHex(color) : theme.colors.textMuted}
                />
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>{t('addHabit.color')}</Text>
        <View style={styles.colorRow}>
          {HABIT_COLOR_KEYS.map((key) => {
            const active = key === color;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  haptics.selection();
                  setColor(key);
                }}
                style={styles.colorWrap}
              >
                <View style={[styles.colorDot, { backgroundColor: habitColorHex(key) }]} />
                {active ? <View style={styles.colorRing} /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>{t('addHabit.period')}</Text>
        <View style={styles.periodRow}>
          {PERIOD_OPTIONS.map((v) => {
            const active = period === v;
            return (
              <Pressable
                key={v}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onPeriodChange(v)}
                style={[styles.periodChip, active && styles.periodChipActive]}
              >
                <Text style={[styles.periodTxt, active && styles.periodTxtActive]}>
                  {t(`addHabit.period${v[0].toUpperCase()}${v.slice(1)}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>{t('addHabit.target')}</Text>
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="minus"
            onPress={() => bump(-1)}
            style={styles.stepBtn}
          >
            <Text style={styles.stepSign}>−</Text>
          </Pressable>
          <View style={styles.stepValue}>
            <Text variant="mono" style={styles.stepNumber}>
              {targetCount}
            </Text>
            <Text muted style={styles.stepUnit}>
              {t('addHabit.timesUnit')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="plus"
            onPress={() => bump(1)}
            style={styles.stepBtn}
          >
            <Text style={styles.stepSign}>+</Text>
          </Pressable>
        </View>
        {errors.targetCount ? (
          <Text style={styles.error}>
            {t('addHabit.errors.targetCount', { min: bounds.min, max: bounds.max })}
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button title={t('addHabit.save')} onPress={onSubmit} />
        {initial ? (
          <Button variant="danger" title={t('addHabit.delete')} onPress={onDelete} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  flex: { flex: 1 },
  content: { padding: theme.spacing(5), gap: theme.spacing(3), paddingBottom: theme.spacing(8) },
  section: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.fontFamily.bold,
    marginTop: theme.spacing(2),
  },
  error: { color: theme.colors.danger, fontSize: theme.fontSize.sm },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing(2) },
  iconCell: {
    width: '22%',
    height: 58,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: { flexDirection: 'row', gap: 14 },
  colorWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  colorDot: { width: 44, height: 44, borderRadius: 22 },
  colorRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: theme.colors.textStrong,
  },

  periodRow: { flexDirection: 'row', gap: 10 },
  periodChip: {
    flex: 1,
    height: 46,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodChipActive: { borderColor: theme.colors.brand, backgroundColor: 'rgba(242,162,76,0.12)' },
  periodTxt: { fontSize: 14, fontFamily: theme.fontFamily.semibold, color: theme.colors.textMuted },
  periodTxtActive: { color: theme.colors.brand },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing(2),
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSign: { fontSize: 24, color: theme.colors.textStrong, fontFamily: theme.fontFamily.bold },
  stepValue: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing(1) },
  stepNumber: { fontSize: theme.fontSize.xxl, color: theme.colors.textStrong },
  stepUnit: { fontSize: theme.fontSize.md },
  footer: {
    padding: theme.spacing(5),
    paddingTop: theme.spacing(3),
    gap: theme.spacing(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
}));
