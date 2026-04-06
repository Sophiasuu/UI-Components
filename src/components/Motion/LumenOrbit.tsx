import { memo, useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DURATION = 9000;

type Props = {
  size?: number;
  backgroundColor?: string;
  showMessage?: boolean;
  message?: string;
};

function LumenOrbit({
  size = 320,
  backgroundColor = '#F7F7F5',
  showMessage = true,
  message = 'Orbit finds calm.',
}: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: DURATION, easing: Easing.linear }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [progress]);

  const orbOneProps = useAnimatedProps(() => {
    const t = progress.value * Math.PI * 2;
    return {
      cx: size * 0.5 + Math.cos(t) * size * 0.21,
      cy: size * 0.5 + Math.sin(t) * size * 0.21,
    };
  });

  const orbTwoProps = useAnimatedProps(() => {
    const t = progress.value * Math.PI * 2;
    return {
      cx: size * 0.5 + Math.cos(t * 0.8 + 2) * size * 0.15,
      cy: size * 0.5 + Math.sin(t * 0.8 + 2) * size * 0.15,
    };
  });

  const orbThreeProps = useAnimatedProps(() => {
    const t = progress.value * Math.PI * 2;
    return {
      cx: size * 0.5 + Math.cos(-t * 1.2 + 1.1) * size * 0.11,
      cy: size * 0.5 + Math.sin(-t * 1.2 + 1.1) * size * 0.11,
    };
  });

  return (
    <View style={[styles.wrap, { backgroundColor }]}> 
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="orbitGlow" cx="50%" cy="50%" r="65%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.76" />
              <Stop offset="100%" stopColor="#E8EFEA" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <Circle cx={size * 0.5} cy={size * 0.5} r={size * 0.36} fill="url(#orbitGlow)" />
          <Circle cx={size * 0.5} cy={size * 0.5} r={size * 0.23} stroke="rgba(24,24,24,0.08)" strokeWidth={1} fill="none" />
          <Circle cx={size * 0.5} cy={size * 0.5} r={size * 0.16} stroke="rgba(24,24,24,0.07)" strokeWidth={1} fill="none" />

          <AnimatedCircle animatedProps={orbOneProps} r={size * 0.037} fill="#1F4037" opacity={0.88} />
          <AnimatedCircle animatedProps={orbTwoProps} r={size * 0.026} fill="#729C8B" opacity={0.82} />
          <AnimatedCircle animatedProps={orbThreeProps} r={size * 0.018} fill="#B4CCBF" opacity={0.86} />
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

export default memo(LumenOrbit);