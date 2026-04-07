import { memo, useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedProps, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CYCLE_DURATION = 7800;
const SEGMENT_COUNT = 22;

type Point = { x: number; y: number };

type Props = {
  size?: number;
  backgroundColor?: string;
  glowColor?: string;
  coreColor?: string;
  showMessage?: boolean;
  message?: string;
};

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(max, Math.max(min, value));
}

function smoothStep(value: number) {
  'worklet';
  const clamped = clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function mix(from: number, to: number, progress: number) {
  'worklet';
  return from + (to - from) * progress;
}

function distanceBetween(a: Point, b: Point) {
  'worklet';
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function buildCurveCommands(points: Point[], includeMove: boolean) {
  'worklet';

  if (points.length === 0) return '';
  let path = includeMove ? `M ${points[0].x} ${points[0].y}` : '';

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = index === 0 ? points[index] : points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = index + 2 < points.length ? points[index + 2] : next;

    const control1X = current.x + (next.x - previous.x) / 9;
    const control1Y = current.y + (next.y - previous.y) / 9;
    const control2X = next.x - (afterNext.x - current.x) / 9;
    const control2Y = next.y - (afterNext.y - current.y) / 9;

    path += ` C ${control1X} ${control1Y} ${control2X} ${control2Y} ${next.x} ${next.y}`;
  }

  return path;
}

function buildSmoothPath(points: Point[]) {
  'worklet';
  return buildCurveCommands(points, true);
}

function getLeadPoint(timeMs: number, width: number, height: number) {
  'worklet';

  const progress = timeMs / CYCLE_DURATION;
  const drift = smoothStep((Math.sin(progress * Math.PI * 2 - 0.9) + 1) / 2);
  const x =
    width * 0.5 +
    Math.sin(progress * Math.PI * 2 * 0.82) * width * 0.18 +
    Math.cos(progress * Math.PI * 2 * 1.73) * width * 0.08;
  const y =
    height * 0.48 +
    Math.cos(progress * Math.PI * 2 * 0.58 + 0.6) * height * 0.18 +
    Math.sin(progress * Math.PI * 2 * 1.28) * height * 0.08 -
    mix(-height * 0.04, height * 0.04, drift);

  return { x, y };
}

function buildTentacleGeometry(size: number, timeMs: number) {
  'worklet';

  const width = size;
  const height = size * 0.82;
  const restLength = size * 0.032;
  const delayStep = 54;
  const points: Point[] = [];

  for (let index = 0; index < SEGMENT_COUNT; index += 1) {
    const delayedTime = Math.max(0, timeMs - index * delayStep);
    const target = getLeadPoint(delayedTime, width, height);

    if (index === 0) {
      points.push(target);
      continue;
    }

    const previous = points[index - 1];
    const dx = target.x - previous.x;
    const dy = target.y - previous.y;
    const distance = Math.max(0.001, Math.sqrt(dx * dx + dy * dy));
    const elastic = 1 + Math.sin(delayedTime * 0.009 + index * 0.55) * Math.exp(-index * 0.18) * 0.14;
    const segmentLength = restLength * elastic;
    const reach = Math.min(segmentLength, distance);

    points.push({
      x: previous.x + (dx / distance) * reach,
      y: previous.y + (dy / distance) * reach,
    });
  }

  const leftEdge: Point[] = [];
  const rightEdge: Point[] = [];

  for (let index = 0; index < points.length; index += 1) {
    const previous = index === 0 ? points[index] : points[index - 1];
    const next = index === points.length - 1 ? points[index] : points[index + 1];
    const tangentX = next.x - previous.x;
    const tangentY = next.y - previous.y;
    const tangentLength = Math.max(0.001, Math.sqrt(tangentX * tangentX + tangentY * tangentY));
    const normalX = -tangentY / tangentLength;
    const normalY = tangentX / tangentLength;
    const taper = 1 - index / (points.length - 1);
    const thickness = mix(size * 0.012, size * 0.09, Math.pow(taper, 1.18));

    leftEdge.push({
      x: points[index].x + normalX * thickness,
      y: points[index].y + normalY * thickness,
    });
    rightEdge.push({
      x: points[index].x - normalX * thickness,
      y: points[index].y - normalY * thickness,
    });
  }

  const ribbonPath = `${buildCurveCommands(leftEdge, true)} L ${rightEdge[rightEdge.length - 1].x} ${rightEdge[rightEdge.length - 1].y}${buildCurveCommands([...rightEdge].reverse(), false)} Z`;

  return {
    width,
    height,
    centerPath: buildSmoothPath(points),
    ribbonPath,
    head: points[0],
    tail: points[points.length - 1],
  };
}

function GlowingTentacle({
  size = 340,
  backgroundColor = '#D9D9D9',
  glowColor = '#5CB8A5',
  coreColor = '#EFFFF8',
  showMessage = true,
  message = 'A quiet intelligence gathers.',
}: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, {
        duration: CYCLE_DURATION,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [progress]);

  const ribbonProps = useAnimatedProps(() => {
    const geometry = buildTentacleGeometry(size, progress.value * CYCLE_DURATION);
    return { d: geometry.ribbonPath };
  });

  const glowPathProps = useAnimatedProps(() => {
    const geometry = buildTentacleGeometry(size, progress.value * CYCLE_DURATION);
    return { d: geometry.centerPath };
  });

  const headProps = useAnimatedProps(() => {
    const geometry = buildTentacleGeometry(size, progress.value * CYCLE_DURATION);
    return { cx: geometry.head.x, cy: geometry.head.y };
  });

  const tailProps = useAnimatedProps(() => {
    const geometry = buildTentacleGeometry(size, progress.value * CYCLE_DURATION);
    return { cx: geometry.tail.x, cy: geometry.tail.y };
  });

  return (
    <View style={[styles.wrap, { backgroundColor }]}> 
      <View style={[styles.stage, { width: size, height: size * 0.82 }]}> 
        <Svg width={size} height={size * 0.82} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="tentacleFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#F4FFF9" stopOpacity="0.96" />
              <Stop offset="40%" stopColor="#A9F0DE" stopOpacity="0.82" />
              <Stop offset="100%" stopColor="#46A791" stopOpacity="0.2" />
            </LinearGradient>
            <RadialGradient id="tentacleAura" cx="50%" cy="50%" r="60%">
              <Stop offset="0%" stopColor={glowColor} stopOpacity="0.38" />
              <Stop offset="100%" stopColor={glowColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <Circle cx={size * 0.5} cy={size * 0.42} r={size * 0.34} fill="url(#tentacleAura)" />

          <AnimatedPath animatedProps={glowPathProps} fill="none" stroke={glowColor} strokeOpacity={0.18} strokeWidth={28} strokeLinecap="round" />
          <AnimatedPath animatedProps={glowPathProps} fill="none" stroke={glowColor} strokeOpacity={0.28} strokeWidth={16} strokeLinecap="round" />
          <AnimatedPath animatedProps={ribbonProps} fill="url(#tentacleFill)" opacity={0.88} />
          <AnimatedPath animatedProps={glowPathProps} fill="none" stroke={coreColor} strokeOpacity={0.9} strokeWidth={2.2} strokeLinecap="round" />

          <AnimatedCircle animatedProps={tailProps} r={4} fill="#6ABBAA" opacity={0.22} />
          <AnimatedCircle animatedProps={headProps} r={8} fill="#F8FFF9" opacity={0.96} />
          <AnimatedCircle animatedProps={headProps} r={18} fill="#BFF7E9" opacity={0.22} />
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
  stage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 24,
    lineHeight: 34,
    textAlign: 'center',
    color: '#315248',
    letterSpacing: 0.4,
    fontFamily: Platform.select({
      web: '"Cormorant Garamond", serif',
      default: 'serif',
    }),
  },
});

export default memo(GlowingTentacle);