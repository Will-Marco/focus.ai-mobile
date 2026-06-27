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
import { useHabitStore, type Habit, type HabitPeriod, type HabitType } from '@entities/habit';
import {
  DEFAULT_TARGET_HOURS,
  PERIOD_OPTIONS,
  TARGET_STEP,
  TYPE_OPTIONS,
} from '../config/options';
import {
  TARGET_MAX_HOURS,
  TARGET_MIN_HOURS,
  validateHabitDraft,
  type HabitFormErrors,
} from '../model/validate';

export interface CreateHabitFormProps {
  /** berilsa — tahrir rejimi. */
  initial?: Habit;
  onDone: () => void;
}

const clampHours = (h: number) =>
  Math.max(TARGET_MIN_HOURS, Math.min(TARGET_MAX_HOURS, Math.round(h * 10) / 10));

export function CreateHabitForm({ initial, onDone }: CreateHabitFormProps) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const addHabit = useHabitStore((s) => s.addHabit);
  const editHabit = useHabitStore((s) => s.editHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);

  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? HABIT_ICON_KEYS[0]);
  const [color, setColor] = useState<string>(initial?.color ?? HABIT_COLOR_KEYS[0]);
  const [type, setType] = useState<HabitType>(initial?.type ?? 'cumulative');
  const [period, setPeriod] = useState<HabitPeriod>(initial?.period ?? 'daily');
  const [targetHours, setTargetHours] = useState(
    initial ? initial.targetMinutes / 60 : DEFAULT_TARGET_HOURS.cumulative,
  );
  const [errors, setErrors] = useState<HabitFormErrors>({});

  const onTypeChange = (next: HabitType) => {
    setType(next);
    // tur o'zgarsa mos default maqsadga o'tamiz (umrlik 100 / davriy 1)
    if (!initial) setTargetHours(DEFAULT_TARGET_HOURS[next]);
  };

  const step = TARGET_STEP[type];
  const bump = (dir: 1 | -1) => setTargetHours((h) => clampHours(h + dir * step));

  const onSubmit = async () => {
    const res = validateHabitDraft({ name, icon, color, type, period, targetHours });
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
                onPress={() => setIcon(key)}
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
                onPress={() => setColor(key)}
                style={styles.colorWrap}
              >
                <View style={[styles.colorDot, { backgroundColor: habitColorHex(key) }]} />
                {active ? <View style={styles.colorRing} /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>{t('addHabit.type')}</Text>
        <View style={styles.typeRow}>
          {TYPE_OPTIONS.map((v) => {
            const active = type === v;
            return (
              <Pressable
                key={v}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onTypeChange(v)}
                style={[styles.typeCard, active && styles.typeCardActive]}
              >
                <Text style={[styles.typeTitle, active && styles.typeTitleActive]}>
                  {v === 'cumulative' ? t('addHabit.typeCumulative') : t('addHabit.typeRecurring')}
                </Text>
                <Text style={styles.typeDesc}>
                  {v === 'cumulative'
                    ? t('addHabit.typeCumulativeDesc')
                    : t('addHabit.typeRecurringDesc')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {type === 'recurring' ? (
          <>
            <Text style={styles.section}>{t('addHabit.period')}</Text>
            <View style={styles.periodRow}>
              {PERIOD_OPTIONS.map((v) => {
                const active = period === v;
                return (
                  <Pressable
                    key={v}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setPeriod(v)}
                    style={[styles.periodChip, active && styles.periodChipActive]}
                  >
                    <Text style={[styles.periodTxt, active && styles.periodTxtActive]}>
                      {t(`addHabit.period${v[0].toUpperCase()}${v.slice(1)}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.period ? <Text style={styles.error}>{t('addHabit.errors.period')}</Text> : null}
          </>
        ) : null}

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
              {targetHours % 1 === 0 ? targetHours : targetHours.toFixed(1)}
            </Text>
            <Text muted style={styles.stepUnit}>
              {t('addHabit.hoursUnit')}
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
        {errors.targetHours ? (
          <Text style={styles.error}>{t('addHabit.errors.targetHours')}</Text>
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

  typeRow: { flexDirection: 'row', gap: 10 },
  typeCard: {
    flex: 1,
    padding: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  typeCardActive: { borderColor: theme.colors.brand, backgroundColor: 'rgba(242,162,76,0.12)' },
  typeTitle: { fontSize: 15, fontFamily: theme.fontFamily.bold, color: theme.colors.textStrong },
  typeTitleActive: { color: theme.colors.brand },
  typeDesc: { fontSize: 12, color: theme.colors.textDim, marginTop: 2 },

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
