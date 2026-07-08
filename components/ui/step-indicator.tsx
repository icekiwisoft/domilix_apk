import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const STEPS = [
  { label: 'Type', route: '/announces/create/step-1' },
  { label: 'Photos', route: '/announces/create/step-2' },
  { label: 'Détails', route: '/announces/create/step-3' },
] as const;

const CIRCLE = 28;

interface StepIndicatorProps {
  current: 1 | 2 | 3;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  const scheme = useColorScheme();
  const C = Colors[scheme ?? 'light'];

  return (
    <View style={styles.row}>
      {STEPS.map(({ label, route }, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;

        return (
          <View key={step} style={styles.item}>
            {/* Left connector half */}
            {i > 0 && (
              <View
                style={[
                  styles.connLeft,
                  { backgroundColor: done || active ? C.primary : C.outlineVariant + '55' },
                ]}
              />
            )}
            {/* Right connector half */}
            {i < STEPS.length - 1 && (
              <View
                style={[
                  styles.connRight,
                  { backgroundColor: done ? C.primary : C.outlineVariant + '55' },
                ]}
              />
            )}

            {/* Circle — tappable only for completed steps */}
            <Pressable
              onPress={done ? () => router.navigate(route as never) : undefined}
              disabled={!done}
              hitSlop={8}
              style={({ pressed }) => [
                styles.circle,
                {
                  backgroundColor: done || active ? C.primary : C.surfaceContainerHigh,
                  borderColor: done || active ? C.primary : C.outlineVariant,
                },
                done && pressed && { opacity: 0.65 },
              ]}
            >
              {done ? (
                <MaterialIcons name="check" size={13} color={C.onPrimary} />
              ) : (
                <Text style={[styles.num, { color: active ? C.onPrimary : C.onSurfaceVariant }]}>
                  {step}
                </Text>
              )}
            </Pressable>

            <Text
              style={[
                styles.label,
                { color: done || active ? C.primary : C.onSurfaceVariant },
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    gap: 5,
  },
  // Left half of connector — from left edge to center of circle
  connLeft: {
    position: 'absolute',
    top: CIRCLE / 2 - 1,
    left: 0,
    right: '50%',
    height: 2,
  },
  // Right half of connector — from center of circle to right edge
  connRight: {
    position: 'absolute',
    top: CIRCLE / 2 - 1,
    left: '50%',
    right: 0,
    height: 2,
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 12,
    lineHeight: 14,
  },
  label: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
});
