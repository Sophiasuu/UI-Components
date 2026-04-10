import { ReactNode, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type PrismActionButtonProps = {
  label: string;
  caption?: string;
  onPress?: () => void;
  icon?: ReactNode;
  style?: ViewStyle;
};

export function PrismActionButton({ label, caption = 'Activated in 120ms', onPress, icon, style }: PrismActionButtonProps) {
  const sweep = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(
      withTiming(1, {
        duration: 1700,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      false,
    );
  }, [sweep]);

  const sweepStyle = useAnimatedStyle(() => {
    const x = interpolate(sweep.value, [0, 1], [-140, 230]);
    return {
      transform: [{ translateX: x }, { skewX: '-20deg' }],
    };
  });

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}>
      <View style={styles.bgA} />
      <View style={styles.bgB} />
      <Animated.View pointerEvents="none" style={[styles.sweep, sweepStyle]} />

      <View style={styles.content}>
        <View style={styles.labelRow}>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.caption}>{caption}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 76,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(20, 13, 33, 0.2)',
    shadowColor: '#180F2A',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    backgroundColor: '#140E23',
  },
  pressed: {
    transform: [{ translateY: 1 }],
  },
  bgA: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#171328',
  },
  bgB: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 26,
    height: 64,
    backgroundColor: '#2D1C52',
    opacity: 0.55,
    transform: [{ rotate: '-8deg' }],
  },
  sweep: {
    position: 'absolute',
    top: -8,
    width: 56,
    height: 120,
    backgroundColor: 'rgba(220, 193, 255, 0.28)',
  },
  content: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#F7EEFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  caption: {
    color: 'rgba(235, 219, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
});
