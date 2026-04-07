import { memo, useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const CYCLE_DURATION = 5200;
const FRAGMENT_SPECS = [
  { x: -18, lift: 20, size: 0.34, delay: 0 },
  { x: 0, lift: 12, size: 0.28, delay: 55 },
  { x: 20, lift: 18, size: 0.24, delay: 90 },
];

type Props = {
  size?: number;
  ballColor?: string;
  lineColor?: string;
  backgroundColor?: string;
  showMessage?: boolean;
  message?: string;
};

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(max, Math.max(min, value));
}

function segmentProgress(value: number, start: number, end: number) {
  'worklet';
  if (value <= start) return 0;
  if (value >= end) return 1;
  return (value - start) / (end - start);
}

function mix(from: number, to: number, progress: number) {
  'worklet';
  return from + (to - from) * progress;
}

function easeInQuad(value: number) {
  'worklet';
  return value * value;
}

function easeOutCubic(value: number) {
  'worklet';
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutSine(value: number) {
  'worklet';
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function pulse(value: number, center: number, width: number) {
  'worklet';
  const distance = Math.abs(value - center) / (width / 2);
  if (distance >= 1) return 0;
  const strength = 1 - distance;
  return strength * strength * (3 - 2 * strength);
}

function smoothStep(value: number) {
  'worklet';
  const clamped = clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function buildSmoothCurve(points: { x: number; y: number }[]) {
  'worklet';

  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = index === 0 ? points[index] : points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = index + 2 < points.length ? points[index + 2] : next;

    const control1X = current.x + (next.x - previous.x) / 8;
    const control1Y = current.y + (next.y - previous.y) / 8;
    const control2X = next.x - (afterNext.x - current.x) / 8;
    const control2Y = next.y - (afterNext.y - current.y) / 8;

    path += ` C ${control1X} ${control1Y} ${control2X} ${control2Y} ${next.x} ${next.y}`;
  }

  return path;
}

function getSurfaceDisplacement(width: number, timeMs: number, x: number) {
  'worklet';

  const impactThree = 2140;
  const settleEnd = 4300;
  const rippleDuration = settleEnd - impactThree;
  const centerX = width / 2;

  if (timeMs < impactThree) {
    return 0;
  }

  const distance = Math.abs(x - centerX);
  const rippleTime = Math.max(0, timeMs - impactThree);
  const travelDelay = distance * 8.8;
  const localTime = Math.max(0, rippleTime - travelDelay);
  const localProgress = clamp(localTime / rippleDuration, 0, 1);
  const arrival = smoothStep(localTime / 220);
  const centerWeight = Math.exp(-distance * 0.012);
  const innerWeight = Math.exp(-(distance * distance) / (width * 30));
  const plunge = 17 * innerWeight * Math.exp(-localTime / 180);
  const oscillationAmplitude = 9.5 * centerWeight * Math.exp(-localTime / 700);
  const oscillation = Math.sin(localTime * 0.016) * oscillationAmplitude;
  const fadeOut = 1 - smoothStep(localProgress);

  return arrival * (plunge + oscillation) * fadeOut;
}

function buildSurfacePath(width: number, lineY: number, timeMs: number) {
  'worklet';

  const left = 18;
  const right = width - 18;

  const points: { x: number; y: number }[] = [{ x: left, y: lineY }];

  for (let x = left + 2; x <= right; x += 2) {
    const y = lineY + getSurfaceDisplacement(width, timeMs, x);

    points.push({ x, y });
  }

  const lastPoint = points[points.length - 1];
  if (lastPoint.x < right) {
    points.push({ x: right, y: lineY });
  }

  return buildSmoothCurve(points);
}

function SplooshFragment({
  clock,
  impactY,
  centerX,
  ballRadius,
  color,
  x,
  lift,
  size,
  delay,
}: {
  clock: Animated.SharedValue<number>;
  impactY: number;
  centerX: number;
  ballRadius: number;
  color: string;
  x: number;
  lift: number;
  size: number;
  delay: number;
}) {
  const fragmentStyle = useAnimatedStyle(() => {
    const timeMs = clock.value * CYCLE_DURATION;
    const start = 2205 + delay;
    const end = 2920 + delay;
    const progress = segmentProgress(timeMs, start, end);
    const arc = Math.sin(progress * Math.PI);
    const opacity = clamp(Math.sin(progress * Math.PI) * 1.2, 0, 1);

    return {
      opacity,
      transform: [
        { translateX: x * easeOutCubic(progress) },
        { translateY: -lift * arc + 8 * progress },
        { scaleX: 1 - 0.22 * progress },
        { scaleY: 1 - 0.4 * progress },
      ],
    };
  });

  const diameter = ballRadius * 2 * size;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.fragment,
        fragmentStyle,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          left: centerX - diameter / 2,
          top: impactY + ballRadius * 0.4,
          backgroundColor: color,
        },
      ]}
    />
  );
}

function SplooshBounce({
  size = 320,
  ballColor = '#2E2A27',
  lineColor = 'rgba(46, 42, 39, 0.9)',
  backgroundColor = '#D9D9D9',
  showMessage = true,
  message = 'Impact turns liquid.',
}: Props) {
  const clock = useSharedValue(0);
  const stageHeight = size * 0.78;
  const ballSize = Math.max(12, size * 0.09);
  const ballRadius = ballSize / 2;
  const ballLeft = size / 2 - ballRadius;
  const ballCenterX = size / 2;
  const lineY = stageHeight * 0.68;
  const startY = stageHeight * 0.16;
  const groundY = lineY - ballSize;
  const bounceOnePeak = stageHeight * 0.34;
  const bounceTwoPeak = stageHeight * 0.47;

  useEffect(() => {
    clock.value = 0;
    clock.value = withRepeat(
      withTiming(1, {
        duration: CYCLE_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(clock);
    };
  }, [clock]);

  const surfaceProps = useAnimatedProps(() => {
    const timeMs = clock.value * CYCLE_DURATION;

    return {
      d: buildSurfacePath(size, lineY, timeMs),
    };
  });

  const ballStyle = useAnimatedStyle(() => {
    const timeMs = clock.value * CYCLE_DURATION;
    const dropOneEnd = 760;
    const bounceOnePeakEnd = 1160;
    const impactTwo = 1540;
    const bounceTwoPeakEnd = 1860;
    const impactThree = 2140;
    const stickEnd = 2158;
    const mergeEnd = 2680;
    const surfaceCenterOffset = getSurfaceDisplacement(size, timeMs, ballCenterX);

    let top = startY;

    if (timeMs < dropOneEnd) {
      top = mix(startY, groundY, easeInQuad(segmentProgress(timeMs, 0, dropOneEnd)));
    } else if (timeMs < bounceOnePeakEnd) {
      top = mix(groundY, bounceOnePeak, easeOutCubic(segmentProgress(timeMs, dropOneEnd, bounceOnePeakEnd)));
    } else if (timeMs < impactTwo) {
      top = mix(bounceOnePeak, groundY, easeInQuad(segmentProgress(timeMs, bounceOnePeakEnd, impactTwo)));
    } else if (timeMs < bounceTwoPeakEnd) {
      top = mix(groundY, bounceTwoPeak, easeOutCubic(segmentProgress(timeMs, impactTwo, bounceTwoPeakEnd)));
    } else if (timeMs < impactThree) {
      top = mix(bounceTwoPeak, groundY, easeInQuad(segmentProgress(timeMs, bounceTwoPeakEnd, impactThree)));
    } else if (timeMs < stickEnd) {
      top = groundY + surfaceCenterOffset * 0.18;
    } else {
      const mergeProgress = segmentProgress(timeMs, stickEnd, mergeEnd);
      const carriedByWave = groundY + surfaceCenterOffset * 0.52;
      top = mix(carriedByWave, groundY + ballRadius * 0.92, easeInOutSine(mergeProgress));
    }

    const squashOne = pulse(timeMs, dropOneEnd + 18, 180);
    const squashTwo = pulse(timeMs, impactTwo + 16, 160);
    const squashThree = pulse(timeMs, impactThree + 30, 320);
    const introOpacity = segmentProgress(timeMs, 0, 160);
    const dissolve = segmentProgress(timeMs, stickEnd + 36, mergeEnd);
    const opacity = clamp(introOpacity * (1 - dissolve), 0, 1);
    const impactLock = pulse(timeMs, impactThree + 18, 100);

    return {
      opacity,
      transform: [
        { translateY: top },
        { scaleX: 1 + 0.18 * squashOne + 0.12 * squashTwo + 0.82 * squashThree + 0.16 * impactLock },
        { scaleY: 1 - 0.14 * squashOne - 0.1 * squashTwo - 0.76 * squashThree - 0.1 * impactLock },
      ],
    };
  });

  const haloStyle = useAnimatedStyle(() => {
    const timeMs = clock.value * CYCLE_DURATION;
    const rippleProgress = segmentProgress(timeMs, 2140, 4200);
    const opacity = Math.exp(-rippleProgress * 2.2) * 0.18;
    const scale = 1 + rippleProgress * 1.6;

    return {
      opacity: timeMs >= 2140 ? opacity : 0,
      transform: [{ scale }],
    };
  });

  const messageStyle = useAnimatedStyle(() => {
    const timeMs = clock.value * CYCLE_DURATION;
    const fadeIn = segmentProgress(timeMs, 2450, 3150);
    const fadeOut = 1 - segmentProgress(timeMs, 4100, 5000);

    return {
      opacity: clamp(fadeIn * fadeOut, 0, 1),
      transform: [{ translateY: 6 * (1 - fadeIn) }],
    };
  });

  return (
    <View style={[styles.wrap, { backgroundColor }]}>
      <View style={[styles.stage, { width: size, height: stageHeight }]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            haloStyle,
            {
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: size * 0.14,
              left: size / 2 - size * 0.14,
              top: lineY - size * 0.14,
            },
          ]}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.ball,
            ballStyle,
            {
              width: ballSize,
              height: ballSize,
              borderRadius: ballRadius,
              left: ballLeft,
              backgroundColor: ballColor,
            },
          ]}
        />

        {FRAGMENT_SPECS.map((fragment, index) => (
          <SplooshFragment
            key={`fragment-${index}`}
            clock={clock}
            impactY={groundY}
            centerX={ballCenterX}
            ballRadius={ballRadius}
            color={ballColor}
            x={fragment.x}
            lift={fragment.lift}
            size={fragment.size}
            delay={fragment.delay}
          />
        ))}

        <Svg width={size} height={stageHeight} style={StyleSheet.absoluteFill}>
          <AnimatedPath
            animatedProps={surfaceProps}
            fill="none"
            stroke={lineColor}
            strokeLinecap="round"
            strokeWidth={2.5}
          />
        </Svg>
      </View>

      {showMessage ? (
        <Animated.Text style={[styles.message, messageStyle]}>{message}</Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 18,
  },
  stage: {
    position: 'relative',
    justifyContent: 'flex-end',
  },
  ball: {
    position: 'absolute',
    top: 0,
  },
  fragment: {
    position: 'absolute',
  },
  halo: {
    position: 'absolute',
    backgroundColor: 'rgba(214, 92, 58, 0.14)',
  },
  message: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: '#3C3936',
    letterSpacing: 0.4,
    fontFamily: Platform.select({
      web: '"Cormorant Garamond", serif',
      default: 'serif',
    }),
  },
});

export default memo(SplooshBounce);