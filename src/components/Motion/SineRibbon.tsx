import { memo, useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const DURATION = 6800;

type Props = {
  size?: number;
  backgroundColor?: string;
  showMessage?: boolean;
  message?: string;
};

function buildWavePath(width: number, height: number, phase: number) {
  'worklet';

  const midY = height * 0.5;
  const left = 20;
  const right = width - 20;
  const points: { x: number; y: number }[] = [];

  for (let x = left; x <= right; x += 4) {
    const n = (x - left) / (right - left);
    const y =
      midY +
      Math.sin(n * Math.PI * 2 * 1.2 + phase) * 18 +
      Math.sin(n * Math.PI * 2 * 2.6 - phase * 0.8) * 6;
    points.push({ x, y });
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const previous = i === 0 ? points[i] : points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    const afterNext = i + 2 < points.length ? points[i + 2] : next;
    const c1x = current.x + (next.x - previous.x) / 8;
    const c1y = current.y + (next.y - previous.y) / 8;
    const c2x = next.x - (afterNext.x - current.x) / 8;
    const c2y = next.y - (afterNext.y - current.y) / 8;
    path += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${next.x} ${next.y}`;
  }

  return path;
}

function SineRibbon({
  size = 340,
  backgroundColor = '#F7F7F5',
  showMessage = true,
  message = 'Waves hold a line.',
}: Props) {
  const progress = useSharedValue(0);
  const width = size;
  const height = size * 0.7;

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

  const ribbonProps = useAnimatedProps(() => ({
    d: buildWavePath(width, height, progress.value * Math.PI * 2),
  }));

  return (
    <View style={[styles.wrap, { backgroundColor }]}> 
      <View style={{ width, height }}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="ribbonInk" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#4A6A5C" stopOpacity="0.22" />
              <Stop offset="50%" stopColor="#31493F" stopOpacity="0.92" />
              <Stop offset="100%" stopColor="#4A6A5C" stopOpacity="0.22" />
            </LinearGradient>
          </Defs>

          <AnimatedPath animatedProps={ribbonProps} fill="none" stroke="rgba(49,73,63,0.14)" strokeWidth={24} strokeLinecap="round" />
          <AnimatedPath animatedProps={ribbonProps} fill="none" stroke="url(#ribbonInk)" strokeWidth={8} strokeLinecap="round" />
          <AnimatedPath animatedProps={ribbonProps} fill="none" stroke="#F8FCFA" strokeWidth={2} strokeLinecap="round" opacity={0.68} />
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

export default memo(SineRibbon);