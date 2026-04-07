import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../theme/tokens';

type PromoSectionProps = {
  headline?: string;
  tagline?: string;
  ctaText?: string;
  onPress?: () => void;
};

export function PromoSection({
  headline = 'Crafted with care.',
  tagline = 'Beautiful UI components for React Native — ready to drop into your next project.',
  ctaText = '@sophiasuu',
}: PromoSectionProps) {
  const pulse = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse, shimmer]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.3, 0.7]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.08]) }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.7, 1, 0.7]),
  }));

  return (
    <View style={styles.wrapper}>
      {/* Animated glow ring behind the card */}
      <Animated.View style={[styles.glowRing, glowStyle]} />

      <View style={styles.card}>
        <View style={styles.accentBar} />

        <View style={styles.body}>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.tagline}>{tagline}</Text>

          <View style={styles.footer}>
            <Animated.View style={[styles.badge, badgeStyle]}>
              <Text style={styles.badgeText}>{ctaText}</Text>
            </Animated.View>
            <View style={styles.dots}>
              <View style={[styles.dot, { backgroundColor: colors.accent }]} />
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={[styles.dot, { backgroundColor: colors.ink }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: radius.lg + 4,
    backgroundColor: colors.accent,
    opacity: 0.3,
  },
  card: {
    width: '100%',
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  accentBar: {
    height: 4,
    backgroundColor: colors.accent,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.canvas,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.body,
    color: '#B3AFA6',
    lineHeight: 24,
    maxWidth: 500,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  badge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeText: {
    color: '#fff',
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
