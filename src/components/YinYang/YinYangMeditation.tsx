import { memo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { useYinYangAnimation } from './useYinYangAnimation';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  size?: number;
  yinColor?: string;
  yangColor?: string;
  backgroundColor?: string;
  glowColor?: string;
  showMessage?: boolean;
  message?: string;
};

function yinHalfPath(cx: number, cy: number, r: number, shift: number, dotR: number) {
  'worklet';
  const h = r / 2;
  const bx = cx + shift;
  // dot center is at the head (upper bulge)
  const dy = cy - h;

  return [
    // half shape
    `M ${cx} ${cy - r}`,
    `A ${r} ${r} 0 0 1 ${cx} ${cy + r}`,
    `A ${h} ${h} 0 0 1 ${bx} ${cy}`,
    `A ${h} ${h} 0 0 0 ${cx} ${cy - r}`,
    'Z',
    // dot (circle via two arcs)
    `M ${cx - dotR} ${dy}`,
    `A ${dotR} ${dotR} 0 0 1 ${cx + dotR} ${dy}`,
    `A ${dotR} ${dotR} 0 0 1 ${cx - dotR} ${dy}`,
    'Z',
  ].join(' ');
}

function yinHalfPathOnly(cx: number, cy: number, r: number, shift: number) {
  'worklet';
  const h = r / 2;
  const bx = cx + shift;

  return [
    `M ${cx} ${cy - r}`,
    `A ${r} ${r} 0 0 1 ${cx} ${cy + r}`,
    `A ${h} ${h} 0 0 1 ${bx} ${cy}`,
    `A ${h} ${h} 0 0 0 ${cx} ${cy - r}`,
    'Z',
  ].join(' ');
}

function yangHalfPath(cx: number, cy: number, r: number, shift: number) {
  'worklet';
  const h = r / 2;
  const bx = cx + shift;

  return [
    `M ${cx} ${cy - r}`,
    `A ${r} ${r} 0 0 0 ${cx} ${cy + r}`,
    `A ${h} ${h} 0 0 0 ${bx} ${cy}`,
    `A ${h} ${h} 0 0 1 ${cx} ${cy - r}`,
    'Z',
  ].join(' ');
}

function YinYangMeditation({
  size = 260,
  yinColor = '#2E2A27',
  yangColor = '#F2F1EC',
  backgroundColor = '#F7F7F5',
  glowColor = '#8C7AAE',
  showMessage = true,
  message = 'Silence gathers shape.',
}: Props) {
  const motion = useYinYangAnimation({});

  const center = size / 2;
  const r = size * 0.36;
  const dotRadius = r * 0.15;
  const orbitDistance = r * 0.45;

  const staticYin = yinHalfPathOnly(center, center, r, 0);
  const staticYang = yinHalfPathOnly(center, center, r, 0);

  // fluid boundary
  const yinPathProps = useAnimatedProps(() => {
    const shift =
      Math.sin(motion.fluidPhase.value) * motion.fluidAmplitude.value;
    return { d: yinHalfPathOnly(center, center, r, shift) };
  });

  const yangPathProps = useAnimatedProps(() => {
    const shift =
      Math.sin(motion.fluidPhase.value) * motion.fluidAmplitude.value;
    return { d: yinHalfPathOnly(center, center, r, shift) };
  });

  // 🎯 YIN — just orbit, no rotation
  const yinStyle = useAnimatedStyle(() => {
    const rf = motion.orbitRadiusFactor.value;
    const angle = motion.orbitAngle.value;

    const tx = Math.cos(angle) * orbitDistance * rf;
    const ty = Math.sin(angle) * orbitDistance * rf;

    return {
      transform: [{ translateX: tx }, { translateY: ty }],
    };
  });

  // 🎯 YANG — opposite side, always 180°
  const yangStyle = useAnimatedStyle(() => {
    const rf = motion.orbitRadiusFactor.value;
    const angle = motion.orbitAngle.value;

    const tx = Math.cos(angle + Math.PI) * orbitDistance * rf;
    const ty = Math.sin(angle + Math.PI) * orbitDistance * rf;

    return {
      transform: [{ translateX: tx }, { translateY: ty }, { rotateZ: `${Math.PI}rad` }],
    };
  });

  const symbolStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotateZ: `${motion.rotationAngle.value}rad` },
        { scale: motion.pulseScale.value },
      ],
    };
  });

  return (
    <View style={[styles.wrap, { backgroundColor }]}>
      <Animated.View style={[{ width: size, height: size }, symbolStyle]}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="aura">
              <Stop offset="0%" stopColor={glowColor} stopOpacity="0.08" />
              <Stop offset="100%" stopColor={glowColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <Circle cx={center} cy={center} r={size * 0.46} fill="url(#aura)" />
        </Svg>

        {/* YIN path (black half) */}
        <Animated.View style={[StyleSheet.absoluteFill, yinStyle]}>
          <Svg width={size} height={size}>
            <AnimatedPath
              d={staticYin}
              animatedProps={yinPathProps}
              fill={yinColor}
            />
          </Svg>
        </Animated.View>

        {/* YANG path (white half rotated 180°) */}
        <Animated.View style={[StyleSheet.absoluteFill, yangStyle]}>
          <Svg width={size} height={size}>
            <AnimatedPath
              d={staticYang}
              animatedProps={yangPathProps}
              fill={yangColor}
            />
          </Svg>
        </Animated.View>

        {/* Dots rendered on top of both halves */}
        {/* White dot on black half */}
        <Animated.View style={[StyleSheet.absoluteFill, yinStyle]} pointerEvents="none">
          <Svg width={size} height={size}>
            <Circle cx={center} cy={center + r / 2} r={dotRadius} fill={yangColor} />
          </Svg>
        </Animated.View>

        {/* Black dot on white half */}
        <Animated.View style={[StyleSheet.absoluteFill, yangStyle]} pointerEvents="none">
          <Svg width={size} height={size}>
            <Circle cx={center} cy={center + r / 2} r={dotRadius} fill={yinColor} />
          </Svg>
        </Animated.View>
      </Animated.View>

      {showMessage && <Text style={styles.message}>{message}</Text>}
    </View>
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

export default memo(YinYangMeditation);