import { memo, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/* ──────── numerology math ──────── */

function reduceToDigit(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((s, c) => s + Number(c), 0);
  }
  return n;
}

function extractDigits(date: string): number[] {
  return date.replace(/\D/g, '').split('').map(Number);
}

function lifePathNumber(date: string): number {
  const sum = extractDigits(date).reduce((a, b) => a + b, 0);
  return reduceToDigit(sum);
}

/* ──────── deterministic scatter ──────── */

function seeded(i: number): number {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

const BG_COUNT = 30;
const FIELD = 280;

type BgParticle = { digit: number; x: number; y: number };

function makeBgParticles(): BgParticle[] {
  const out: BgParticle[] = [];
  for (let i = 0; i < BG_COUNT; i++) {
    out.push({
      digit: Math.floor(seeded(i + 100) * 10),
      x: seeded(i * 2 + 1) * FIELD,
      y: seeded(i * 2 + 2) * FIELD,
    });
  }
  return out;
}

/**
 * Build the "dial sequence" — the array of digits the display cycles through.
 * The sequence is designed so the dialing rhythm is:
 *   slow (few digits) → fast (many) → slow → slight pickup → land on result
 *
 * Total ~40 steps. The speed is controlled by the progress curve, but we
 * also space digits to reinforce the feel.
 */
function buildDialSequence(result: number): number[] {
  const seq: number[] = [];
  // Phase A: slow start — 4 digits
  for (let i = 0; i < 4; i++) seq.push((result + 3 + i * 3) % 10);
  // Phase B: fast — 20 digits
  for (let i = 0; i < 20; i++) seq.push((result + 7 + i * 7) % 10);
  // Phase C: slow down — 6 digits
  for (let i = 0; i < 6; i++) seq.push((result + 2 + i * 4) % 10);
  // Phase D: slight pickup — 8 digits
  for (let i = 0; i < 8; i++) seq.push((result + 5 + i * 3) % 10);
  // Final landing
  seq.push(result);
  return seq;
}

const TOTAL_STEPS = 39; // 0-indexed last step (4+20+6+8+1 = 39)

/* ──────── component ──────── */

type Props = {
  size?: number;
  birthDate?: string;
  backgroundColor?: string;
  showMessage?: boolean;
  message?: string;
};

function NumerologyMesh({
  size = 300,
  birthDate = '11-05-1992',
  backgroundColor = '#D9D9D9',
  showMessage = true,
  message,
}: Props) {
  const result = useMemo(() => lifePathNumber(birthDate), [birthDate]);
  const dialSeq = useMemo(() => buildDialSequence(result), [result]);
  const bgParticles = useMemo(() => makeBgParticles(), []);

  const displayMessage = message ?? 'Your path has always been written.';

  // Progress drives dial position (0 → TOTAL_STEPS)
  const dialProgress = useSharedValue(0);
  const msgOpacity = useSharedValue(0);
  const breathe = useSharedValue(0);

  // Displayed digit index (driven on UI thread)
  const currentIdx = useDerivedValue(() =>
    Math.min(Math.round(dialProgress.value), TOTAL_STEPS),
  );

  const [displayDigit, setDisplayDigit] = useState(dialSeq[0]);

  useAnimatedReaction(
    () => currentIdx.value,
    (idx) => {
      const d = dialSeq[Math.min(idx, dialSeq.length - 1)];
      runOnJS(setDisplayDigit)(d);
    },
  );

  useEffect(() => {
    dialProgress.value = 0;
    msgOpacity.value = 0;

    // The dial curve: slow→pickup→fast→slow→land
    dialProgress.value = withDelay(
      400,
      withSequence(
        // Phase A: slow start (steps 0→4) — 700ms
        withTiming(4, { duration: 700, easing: Easing.in(Easing.quad) }),
        // Phase B: picking up speed (steps 4→14) — 500ms
        withTiming(14, { duration: 500, easing: Easing.in(Easing.quad) }),
        // Phase C: fast (steps 14→32) — 600ms
        withTiming(32, { duration: 600, easing: Easing.linear }),
        // Phase D: slowing down (steps 32→38) — 600ms
        withTiming(38, { duration: 600, easing: Easing.out(Easing.quad) }),
        // Final land (step 38→39) — 400ms with snap
        withTiming(TOTAL_STEPS, { duration: 400, easing: Easing.out(Easing.cubic) }),
      ),
    );

    msgOpacity.value = withDelay(
      400 + 700 + 500 + 600 + 600 + 400 + 300,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
    );

    breathe.value = withDelay(
      400 + 3400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [birthDate]);

  const containerBreath = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.01 * breathe.value }],
  }));

  const msgStyle = useAnimatedStyle(() => ({
    opacity: msgOpacity.value,
  }));

  // Progress normalized 0→1 for bg particles
  const normProgress = useDerivedValue(() => dialProgress.value / TOTAL_STEPS);

  // Main number style — scale snap on final landing
  const numberStyle = useAnimatedStyle(() => {
    const p = dialProgress.value;
    const fadeIn = interpolate(p, [0, 0.5], [0, 1], 'clamp');
    // Snap: slight overshoot when landing on final
    const nearEnd = interpolate(p, [TOTAL_STEPS - 1.5, TOTAL_STEPS - 0.5, TOTAL_STEPS], [1, 1.06, 1], 'clamp');
    return {
      opacity: fadeIn,
      transform: [{ scale: nearEnd }],
    };
  });

  const scale = size / FIELD;

  return (
    <View style={[styles.wrap, { backgroundColor }]}>
      <Animated.View
        style={[{ width: size, height: size, position: 'relative' }, containerBreath]}
      >
        {/* Background noise */}
        {bgParticles.map((p, i) => (
          <BgDigit
            key={`bg-${i}`}
            digit={p.digit}
            x={p.x * scale}
            y={p.y * scale}
            index={i}
            normProgress={normProgress}
          />
        ))}

        {/* Central dialing number */}
        <Animated.View style={[styles.dialWrap, numberStyle]} pointerEvents="none">
          <Animated.Text style={styles.dialNumber}>{displayDigit}</Animated.Text>
        </Animated.View>
      </Animated.View>

      {showMessage && (
        <Animated.Text style={[styles.message, msgStyle]}>
          {displayMessage}
        </Animated.Text>
      )}
    </View>
  );
}

/* ──────── background digit ──────── */

const BgDigit = memo(function BgDigit({
  digit,
  x,
  y,
  index,
  normProgress,
}: {
  digit: number;
  x: number;
  y: number;
  index: number;
  normProgress: Animated.SharedValue<number>;
}) {
  const driftPhase = useSharedValue(seeded(index + 200));

  useEffect(() => {
    driftPhase.value = withRepeat(
      withTiming(driftPhase.value + 1, {
        duration: 4000 + index * 120,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const opacity = interpolate(normProgress.value, [0, 0.08, 0.6, 0.85], [0, 0.15, 0.12, 0], 'clamp');
    const drift = Math.sin(driftPhase.value * Math.PI * 2) * 3;
    return {
      position: 'absolute' as const,
      left: x + drift,
      top: y + drift * 0.6,
      opacity,
    };
  });

  return (
    <Animated.View style={style}>
      <Animated.Text style={styles.bgDigit}>{digit}</Animated.Text>
    </Animated.View>
  );
});

/* ──────── styles ──────── */

const fontFamily = Platform.select({
  web: '"Cormorant Garamond", serif',
  default: 'serif',
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 20,
  },
  bgDigit: {
    fontSize: 14,
    color: 'rgba(46,42,39,0.15)',
    fontFamily,
    fontWeight: '300',
  },
  dialWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialNumber: {
    fontSize: 72,
    fontWeight: '300',
    color: '#2E2A27',
    fontFamily,
  },
  message: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: 'center',
    color: '#3C3936',
    letterSpacing: 0.6,
    fontFamily,
    opacity: 0,
  },
});

export default memo(NumerologyMesh);
