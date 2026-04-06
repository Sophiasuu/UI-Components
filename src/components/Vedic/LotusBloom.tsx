import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ──────── geometry ──────── */

const CX = 100;
const CY = 152;

// Petal silhouettes — base at (0,0), pointing up
const CORE_D = 'M0,0 C-6,-22 -5,-52 0,-68 C5,-52 6,-22 0,0Z';
const MED_D = 'M0,0 C-8,-18 -8,-46 0,-62 C8,-46 8,-18 0,0Z';
const WIDE_D = 'M0,0 C-10,-15 -10,-40 0,-56 C10,-40 10,-15 0,0Z';

type PetalDef = {
  tier: 1 | 2 | 3;
  angle: number; // target rotation (degrees) when fully open
  d: string;
  grad: string;
};

// Render order: outermost first (behind), core last (front)
const PETALS: PetalDef[] = [
  // Tier 3 — outer ring (8 petals), wide splay ≈45°
  { tier: 3, angle: -62, d: WIDE_D, grad: 'gO' },
  { tier: 3, angle: 62, d: WIDE_D, grad: 'gO' },
  { tier: 3, angle: -48, d: WIDE_D, grad: 'gO' },
  { tier: 3, angle: 48, d: WIDE_D, grad: 'gO' },
  { tier: 3, angle: -34, d: WIDE_D, grad: 'gO' },
  { tier: 3, angle: 34, d: WIDE_D, grad: 'gO' },
  { tier: 3, angle: -18, d: MED_D, grad: 'gO' },
  { tier: 3, angle: 18, d: MED_D, grad: 'gO' },
  // Tier 2 — inner ring (4 petals), moderate splay ≈20°
  { tier: 2, angle: -22, d: MED_D, grad: 'gI' },
  { tier: 2, angle: 22, d: MED_D, grad: 'gI' },
  { tier: 2, angle: -8, d: MED_D, grad: 'gI' },
  { tier: 2, angle: 8, d: MED_D, grad: 'gI' },
  // Tier 1 — core (1 petal), grows tall
  { tier: 1, angle: 0, d: CORE_D, grad: 'gC' },
];

const STEM_D = `M${CX},${CY} Q${CX - 2},${CY + 22} ${CX},${CY + 48}`;

const SEEDS = [
  { cx: CX, cy: CY - 5 },
  { cx: CX - 3.5, cy: CY - 9 },
  { cx: CX + 3.5, cy: CY - 9 },
  { cx: CX, cy: CY - 13 },
];

/** Map tier → [start, end] within bloom [0→1] — cascade effect */
function tierWindow(tier: 1 | 2 | 3): [number, number] {
  if (tier === 1) return [0, 0.38]; // core rises first
  if (tier === 2) return [0.12, 0.68]; // inner ring starts at ~30% of core
  return [0.35, 1.0]; // outer ring starts at ~50% of tier 2
}

/* ──────── main component ──────── */

type Props = {
  size?: number;
  backgroundColor?: string;
  showMessage?: boolean;
  message?: string;
};

function LotusBloom({
  size = 300,
  backgroundColor = '#F7F7F5',
  showMessage = true,
  message = 'Within the mud, the lotus blooms.',
}: Props) {
  const bloom = useSharedValue(0);
  const breathe = useSharedValue(0);
  const msgOpacity = useSharedValue(0);

  useEffect(() => {
    // Spring bloom — subtle overshoot gives a "joyful bounce" at full bloom
    bloom.value = withDelay(
      300,
      withSpring(1, { mass: 1, damping: 12, stiffness: 18, overshootClamping: false }),
    );

    msgOpacity.value = withDelay(
      3600,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
    );

    breathe.value = withDelay(
      4200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.012 * breathe.value }],
  }));

  const msgStyle = useAnimatedStyle(() => ({
    opacity: msgOpacity.value,
  }));

  // Stem fades in early
  const stemProps = useAnimatedProps(() => ({
    opacity: interpolate(bloom.value, [0, 0.15], [0, 0.55], 'clamp'),
  }));

  return (
    <View style={[styles.wrap, { backgroundColor }]}>
      <Animated.View style={[{ width: size, height: size }, breatheStyle]}>
        <Svg width={size} height={size} viewBox="0 0 200 210">
          <Defs>
            <LinearGradient id="gC" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#FAE8E4" />
              <Stop offset="100%" stopColor="#E09CA6" />
            </LinearGradient>
            <LinearGradient id="gI" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#F2D4CE" />
              <Stop offset="100%" stopColor="#D08490" />
            </LinearGradient>
            <LinearGradient id="gO" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#EACAC2" />
              <Stop offset="100%" stopColor="#BE6878" />
            </LinearGradient>
            <LinearGradient id="gStem" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#A8B098" />
              <Stop offset="100%" stopColor="#8A9478" />
            </LinearGradient>
          </Defs>

          {/* Stem */}
          <AnimatedPath
            d={STEM_D}
            stroke="url(#gStem)"
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
            animatedProps={stemProps}
          />

          {/* Petals — outer behind, core on top */}
          {PETALS.map((p, i) => (
            <PetalShape key={i} def={p} bloom={bloom} />
          ))}

          {/* Center seed dots */}
          {SEEDS.map((s, i) => (
            <SeedDot key={`s-${i}`} cx={s.cx} cy={s.cy} bloom={bloom} />
          ))}
        </Svg>
      </Animated.View>

      {showMessage && (
        <Animated.Text style={[styles.message, msgStyle]}>
          {message}
        </Animated.Text>
      )}
    </View>
  );
}

/* ──────── animated petal ──────── */

const PetalShape = memo(function PetalShape({
  def,
  bloom,
}: {
  def: PetalDef;
  bloom: Animated.SharedValue<number>;
}) {
  const [start, end] = tierWindow(def.tier);

  const animProps = useAnimatedProps(() => {
    const t = interpolate(bloom.value, [start, end], [0, 1], 'clamp');
    return {
      rotation: def.angle * t,
      scale: interpolate(t, [0, 1], [def.tier === 1 ? 0.5 : 0.6, 1], 'clamp'),
      opacity: interpolate(t, [0, 0.1], [0, 1], 'clamp'),
    };
  });

  return (
    <AnimatedG
      x={CX}
      y={CY}
      originX={0}
      originY={0}
      animatedProps={animProps}
    >
      <Path
        d={def.d}
        fill={`url(#${def.grad})`}
        stroke="rgba(160,100,110,0.12)"
        strokeWidth={0.4}
      />
    </AnimatedG>
  );
});

/* ──────── seed dot ──────── */

const SeedDot = memo(function SeedDot({
  cx,
  cy,
  bloom,
}: {
  cx: number;
  cy: number;
  bloom: Animated.SharedValue<number>;
}) {
  const animProps = useAnimatedProps(() => {
    const t = interpolate(bloom.value, [0.5, 0.75], [0, 1], 'clamp');
    return { opacity: t, r: 2 * t };
  });

  return <AnimatedCircle cx={cx} cy={cy} r={0} fill="#D4A878" animatedProps={animProps} />;
});

/* ──────── styles ──────── */

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  message: {
    fontFamily: 'Georgia',
    fontSize: 16,
    color: '#2E2A27',
    letterSpacing: 0.5,
    opacity: 0,
  },
});

export default memo(LotusBloom);
