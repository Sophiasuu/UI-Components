import { memo, useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, G } from 'react-native-svg';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ──────── constellation data ──────── */

type Star = { x: number; y: number; r: number };
type Edge = [number, number];

// Leo sickle + body
const STARS: Star[] = [
  { x: 42, y: 52, r: 3.8 },   // 0 Regulus
  { x: 56, y: 36, r: 2.6 },   // 1
  { x: 72, y: 28, r: 2.4 },   // 2
  { x: 88, y: 36, r: 2.8 },   // 3
  { x: 82, y: 56, r: 2.2 },   // 4
  { x: 66, y: 62, r: 2.4 },   // 5
  { x: 42, y: 52, r: 0 },     // 6 (back to Regulus, no extra dot)
  { x: 108, y: 72, r: 2.6 },  // 7 body
  { x: 138, y: 82, r: 2.4 },  // 8
  { x: 158, y: 68, r: 3.0 },  // 9 Denebola
];
const EDGES: Edge[] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], // sickle
  [4, 7], [7, 8], [8, 9],                           // body → tail
];

const TOTAL_EDGES = EDGES.length;

/* ──────── component ──────── */

type Props = {
  size?: number;
  starColor?: string;
  lineColor?: string;
  glowColor?: string;
  backgroundColor?: string;
  showMessage?: boolean;
  message?: string;
};

function ConstellationSplash({
  size = 280,
  starColor = '#2E2A27',
  lineColor = 'rgba(46, 42, 39, 0.3)',
  glowColor = 'rgba(140, 122, 174, 0.22)',
  backgroundColor = '#D9D9D9',
  showMessage = true,
  message = 'The stars remember.',
}: Props) {
  const progress = useSharedValue(0);
  const twinkle = useSharedValue(0);
  const messageOpacity = useSharedValue(0);

  useEffect(() => {
    // draw lines one by one
    progress.value = withDelay(
      400,
      withTiming(TOTAL_EDGES, {
        duration: 380 * TOTAL_EDGES + 500,
        easing: Easing.out(Easing.quad),
      }),
    );

    // message fades in after constellation is drawn
    messageOpacity.value = withDelay(
      400 + 380 * TOTAL_EDGES + 500,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }),
    );

    // subtle twinkle after all lines drawn
    twinkle.value = withDelay(
      400 + 380 * TOTAL_EDGES + 500 + 400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const twinkleStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + 0.15 * twinkle.value,
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
  }));

  // pre-compute when each star first appears
  const starThresholds = useMemo(() => {
    return STARS.map((_, si) => {
      for (let i = 0; i < EDGES.length; i++) {
        if (EDGES[i][0] === si || EDGES[i][1] === si) return i;
      }
      return TOTAL_EDGES;
    });
  }, []);

  return (
    <View style={[styles.wrap, { backgroundColor }]}>
      <Animated.View style={[{ width: size, height: size }, twinkleStyle]}>
        <Svg width={size} height={size} viewBox="0 0 200 120">
          {EDGES.map(([a, b], i) => (
            <AnimatedEdge
              key={`e-${i}`}
              index={i}
              x1={STARS[a].x}
              y1={STARS[a].y}
              x2={STARS[b].x}
              y2={STARS[b].y}
              progress={progress}
              lineColor={lineColor}
            />
          ))}

          {STARS.map((s, i) =>
            s.r > 0 ? (
              <AnimatedStar
                key={`s-${i}`}
                cx={s.x}
                cy={s.y}
                r={s.r}
                threshold={starThresholds[i]}
                progress={progress}
                starColor={starColor}
                glowColor={glowColor}
              />
            ) : null,
          )}
        </Svg>
      </Animated.View>

      {showMessage && (
        <Animated.Text style={[styles.message, messageStyle]}>
          {message}
        </Animated.Text>
      )}
    </View>
  );
}

/* ──────── animated sub-components ──────── */

function AnimatedEdge({
  index, x1, y1, x2, y2, progress, lineColor,
}: {
  index: number; x1: number; y1: number; x2: number; y2: number;
  progress: Animated.SharedValue<number>; lineColor: string;
}) {
  const props = useAnimatedProps(() => {
    const t = interpolate(progress.value, [index, index + 1], [0, 1], 'clamp');
    return {
      x2: x1 + (x2 - x1) * t,
      y2: y1 + (y2 - y1) * t,
      opacity: t > 0 ? 0.3 + 0.7 * t : 0,
    };
  });

  return (
    <AnimatedLine
      x1={x1} y1={y1} x2={x1} y2={y1}
      animatedProps={props}
      stroke={lineColor}
      strokeWidth={0.8}
      strokeLinecap="round"
    />
  );
}

function AnimatedStar({
  cx, cy, r, threshold, progress, starColor, glowColor,
}: {
  cx: number; cy: number; r: number; threshold: number;
  progress: Animated.SharedValue<number>;
  starColor: string; glowColor: string;
}) {
  const starProps = useAnimatedProps(() => {
    const t = interpolate(progress.value, [threshold, threshold + 0.5], [0, 1], 'clamp');
    return { opacity: t, r: r * t };
  });

  const glowProps = useAnimatedProps(() => {
    const t = interpolate(progress.value, [threshold, threshold + 0.5], [0, 1], 'clamp');
    return { opacity: t * 0.8, r: r * 3 * t };
  });

  return (
    <G>
      <AnimatedCircle cx={cx} cy={cy} r={0} animatedProps={glowProps} fill={glowColor} />
      <AnimatedCircle cx={cx} cy={cy} r={0} animatedProps={starProps} fill={starColor} />
    </G>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 20,
  },
  message: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: 'center',
    color: '#3C3936',
    letterSpacing: 0.6,
    fontFamily: Platform.select({
      web: '"Cormorant Garamond", serif',
      default: 'serif',
    }),
  },
});

export default memo(ConstellationSplash);
