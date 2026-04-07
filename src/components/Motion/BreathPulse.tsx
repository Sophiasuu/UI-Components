import { memo, useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DURATION = 5200;

type Props = {
  size?: number;
  backgroundColor?: string;
  showMessage?: boolean;
  message?: string;
};

function BreathPulse({
  size = 320,
  backgroundColor = '#D9D9D9',
  showMessage = true,
  message = 'Breath expands space.',
}: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, {
        duration: DURATION,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [progress]);

  const pulseOneProps = useAnimatedProps(() => ({
    r: size * (0.12 + progress.value * 0.2),
    opacity: 0.35 - progress.value * 0.25,
  }));

  const pulseTwoProps = useAnimatedProps(() => ({
    r: size * (0.2 + progress.value * 0.2),
    opacity: 0.22 - progress.value * 0.16,
  }));

  const coreProps = useAnimatedProps(() => ({
    r: size * (0.075 + progress.value * 0.02),
  }));

  return (
    <View style={[styles.wrap, { backgroundColor }]}> 
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="pulseAura" cx="50%" cy="50%" r="58%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#DCE7E2" stopOpacity="0.08" />
            </RadialGradient>
          </Defs>

          <Circle cx={size * 0.5} cy={size * 0.5} r={size * 0.34} fill="url(#pulseAura)" />
          <AnimatedCircle animatedProps={pulseTwoProps} cx={size * 0.5} cy={size * 0.5} fill="none" stroke="rgba(42,69,58,0.2)" strokeWidth={2} />
          <AnimatedCircle animatedProps={pulseOneProps} cx={size * 0.5} cy={size * 0.5} fill="none" stroke="rgba(42,69,58,0.34)" strokeWidth={2.5} />
          <AnimatedCircle animatedProps={coreProps} cx={size * 0.5} cy={size * 0.5} fill="#2A453A" />
        </Svg>
      </View>

      {showMessage ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 18,
  },
  message: {
    fontSize: 24,
    lineHeight: 34,
    textAlign: 'center',
    color: '#34403B',
    letterSpacing: 0.35,
    fontFamily: Platform.select({
      web: '"Cormorant Garamond", serif',
      default: 'serif',
    }),
  },
});

export default memo(BreathPulse);