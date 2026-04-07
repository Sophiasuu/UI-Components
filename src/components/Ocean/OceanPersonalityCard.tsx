import { memo, useEffect, useMemo } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

/* ─── layout ─── */
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const VB = 480;
const CX = VB / 2;
const CY = VB / 2;
const R = 130;

const LABELS = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'] as const;
const LETTERS = ['O', 'C', 'E', 'A', 'N'] as const;
const VALUES = [0.82, 0.65, 0.48, 0.91, 0.33];

const JOBS: { title: string; desc: string; pct: number; accent: string; emoji: string }[] = [
  { title: 'UX Researcher', desc: 'High Openness + Agreeableness', pct: 94, accent: '#5EECD0', emoji: '🔬' },
  { title: 'Therapist / Counselor', desc: 'High Agreeableness + Low Neuroticism', pct: 91, accent: '#F0887E', emoji: '🧠' },
  { title: 'Data Scientist', desc: 'High Conscientiousness + Openness', pct: 87, accent: '#6CB4F7', emoji: '📊' },
];

const DUR = 19;
const G = {
  hookIn: 0.3, hookOut: 2.2,       // hook text
  painIn: 3.0, painOut: 5.5,       // overwhelm
  birth: 7.0, radar: 8.6,          // radar appears
  fill: 10.6, lock: 11.8,          // polygon fills + lock
  scroll: 13.2, header: 13.5,      // scroll to results
  jobs: 16.0, tag: 19,             // job cards + tagline
};

const mono = Platform.select({ web: '"SF Mono", "Fira Code", "Menlo", monospace', default: 'monospace' });
const sans = Platform.select({ web: '"Inter", "SF Pro Display", "Helvetica Neue", sans-serif', default: undefined });

/* ─── geometry ─── */
function ang(i: number) { 'worklet'; return -Math.PI / 2 + (i * 2 * Math.PI) / 5; }
function px(i: number, r: number) { 'worklet'; return CX + Math.cos(ang(i)) * r; }
function py(i: number, r: number) { 'worklet'; return CY + Math.sin(ang(i)) * r; }
function pent(r: number) { return Array.from({ length: 5 }, (_, i) => `${px(i, r)},${py(i, r)}`).join(' '); }

/* ─── particles ─── */
const PN = 50;
type P = { x: number; y0: number; r: number; a: number; d: number; dr: number };
function mkP(): P[] {
  return Array.from({ length: PN }, () => ({
    x: Math.random() * VB,
    y0: VB * 1.8 + Math.random() * VB * 0.5,
    r: 0.5 + Math.random() * 1.6,
    a: 0.1 + Math.random() * 0.35,
    d: Math.random() * 8,
    dr: 2 + Math.random() * 3.5,
  }));
}

/* ─── sub-components ─── */
const Dot = memo(function Dot({ p, clk }: { p: P; clk: Animated.SharedValue<number> }) {
  const ap = useAnimatedProps(() => {
    const t = clk.value;
    const cycle = ((t + p.d) % 14) / 14;
    return {
      cx: String(p.x + Math.sin(t * 0.4 + p.d * 2) * p.dr),
      cy: String(p.y0 - cycle * (VB * 1.8 + 60)),
      opacity: p.a * Math.min(1, t / 0.6),
    };
  });
  return <AnimatedCircle animatedProps={ap} r={p.r} fill="#85B7EB" />;
});

const Sonar = memo(function Sonar({ i, p }: { i: number; p: Animated.SharedValue<number> }) {
  const ap = useAnimatedProps(() => {
    const local = Math.max(0, Math.min(1, (p.value - i * 0.1) / 0.65));
    const smooth = local * local * (3 - 2 * local); // smoothstep
    const s = 0.06 + smooth * 1.4;
    const fade = smooth < 0.2 ? smooth / 0.2 : Math.max(0, 1 - (smooth - 0.2) / 0.8);
    const r = R * s;
    const pts: string[] = [];
    for (let j = 0; j < 5; j++) pts.push(`${px(j, r)},${py(j, r)}`);
    return { points: pts.join(' '), opacity: fade * 0.35, strokeWidth: String(1 - smooth * 0.5) };
  });
  return <AnimatedPolygon animatedProps={ap} fill="none" stroke="#85B7EB" />;
});

const SpokeEl = memo(function SpokeEl({ i, ex, ey, p }: { i: number; ex: number; ey: number; p: Animated.SharedValue<number> }) {
  const ap = useAnimatedProps(() => {
    const local = Math.max(0, Math.min(1, (p.value - i * 0.06) / 0.55));
    const smooth = local * local * (3 - 2 * local); // smoothstep
    return {
      x2: String(CX + (ex - CX) * smooth),
      y2: String(CY + (ey - CY) * smooth),
      opacity: smooth * 0.3,
    };
  });
  return <AnimatedLine x1={String(CX)} y1={String(CY)} animatedProps={ap} stroke="#85B7EB" strokeWidth={0.5} />;
});

const GridEl = memo(function GridEl({ pts, ring, p, maxOp, sw }: { pts: string; ring: number; p: Animated.SharedValue<number>; maxOp?: number; sw?: number }) {
  const ap = useAnimatedProps(() => {
    const local = Math.max(0, Math.min(1, (p.value - ring * 0.12) / 0.4));
    const smooth = local * local * (3 - 2 * local);
    return { opacity: smooth * (maxOp ?? 0.12) };
  });
  return <AnimatedPolygon animatedProps={ap} points={pts} fill="none" stroke="#85B7EB" strokeWidth={sw ?? 0.4} />;
});



const Lbl = memo(function Lbl({ i, label, letter, p }: { i: number; label: string; letter: string; p: Animated.SharedValue<number> }) {
  const a = ang(i);
  const lR = R + 28;
  const lx = CX + Math.cos(a) * lR;
  const ly = CY + Math.sin(a) * lR;
  const tR = R + 58;
  const tx = CX + Math.cos(a) * tR;
  const ty = CY + Math.sin(a) * tR;

  const lp = useAnimatedProps(() => {
    const l = Math.max(0, Math.min(1, (p.value - i * 0.08) / 0.45));
    const s = l * l * (3 - 2 * l);
    return { opacity: s * 0.95 };
  });
  const tp = useAnimatedProps(() => {
    const l = Math.max(0, Math.min(1, (p.value - i * 0.08) / 0.45));
    const s = l * l * (3 - 2 * l);
    return { opacity: s * 0.6, y: String(ty + (1 - s) * 6) };
  });
  return (
    <>
      <AnimatedSvgText animatedProps={lp} x={lx} y={ly} fill="#378ADD" fontSize="24" fontWeight="700" fontFamily={sans ?? undefined} textAnchor="middle" alignmentBaseline="central">{letter}</AnimatedSvgText>
      <AnimatedSvgText animatedProps={tp} x={tx} fill="rgba(133,183,235,0.55)" fontSize="13" fontWeight="500" fontFamily={sans ?? undefined} textAnchor="middle" letterSpacing="0.6">{label}</AnimatedSvgText>
    </>
  );
});



const RimEl = memo(function RimEl({ lp, sh }: { lp: Animated.SharedValue<number>; sh: Animated.SharedValue<number> }) {
  const rimR = R + 56;
  const pts = pent(rimR);
  const perim = 5 * 2 * rimR * Math.sin(Math.PI / 5);
  const ap = useAnimatedProps(() => ({
    opacity: lp.value * 0.45,
    strokeDashoffset: String(-sh.value * perim),
  }));
  return (
    <>
      <AnimatedPolygon animatedProps={ap} points={pts} fill="none" stroke="#85B7EB" strokeWidth={0.8} strokeDasharray={`${perim * 0.06},${perim * 0.94}`} />
      <Polygon points={pts} fill="none" stroke="rgba(133,183,235,0.05)" strokeWidth={0.4} />
    </>
  );
});

/* ─── Intro: Hook — instant bold text ─── */
const IntroHook = memo(function IntroHook() {
  return (
    <View style={styles.introCenter}>
      <Text style={styles.hookBold}>Turn your personality{"\n"}into a career plan</Text>
    </View>
  );
});

/* ─── Intro: Pain / overwhelm ─── */
const PAIN_OPTIONS = [
  { text: 'Marketing?', x: -90, y: -70 },
  { text: 'Medicine?', x: 60, y: -55 },
  { text: 'Law?', x: -40, y: -15 },
  { text: 'Engineering?', x: 75, y: 10 },
  { text: 'Finance?', x: -85, y: 35 },
  { text: 'Design?', x: 30, y: 55 },
  { text: 'Teaching?', x: -55, y: 80 },
  { text: 'Psychology?', x: 65, y: -25 },
  { text: 'Data Science?', x: -20, y: 110 },
];
const IntroPain = memo(function IntroPain({ master }: { master: Animated.SharedValue<number> }) {
  return (
    <View style={styles.introCenter}>
      {PAIN_OPTIONS.map((opt, i) => (
        <PainChip key={i} opt={opt} index={i} total={PAIN_OPTIONS.length} master={master} />
      ))}
    </View>
  );
});

const PainChip = memo(function PainChip({ opt, index, total, master }: { opt: typeof PAIN_OPTIONS[number]; index: number; total: number; master: Animated.SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const t = master.value * DUR;
    const stagger = index * 0.18;
    const fadeIn = Math.max(0, Math.min(1, (t - G.painIn - stagger) / 0.4));
    const fadeOut = Math.max(0, Math.min(1, (G.painOut - 0.3 - t) / 0.3));
    const op = Math.min(fadeIn, fadeOut);
    const smooth = op * op * (3 - 2 * op);
    // subtle float
    const drift = Math.sin((t + index * 1.3) * 1.2) * 4;
    return {
      opacity: smooth * (0.5 + (index % 3) * 0.2),
      transform: [
        { translateX: opt.x },
        { translateY: opt.y + drift + (1 - fadeIn) * 20 },
        { scale: 0.85 + smooth * 0.15 },
      ],
    };
  });
  return (
    <Animated.View style={[styles.painChip, style]}>
      <Text style={styles.painChipText}>{opt.text}</Text>
    </Animated.View>
  );
});

/* Typewriter tagline — reveals characters one by one */
const TAG_TEXT = 'Leverage your strengths\ninstead of following the masses';
const TAG_CHARS = TAG_TEXT.split('');

const TypewriterTag = memo(function TypewriterTag({ progress }: { progress: Animated.SharedValue<number> }) {
  return (
    <View style={styles.tagWrap}>
      <View style={styles.tagRow}>
        {TAG_CHARS.map((ch, i) => (
          ch === '\n' ? <View key={i} style={styles.tagBreak} /> :
          <TypewriterChar key={i} char={ch} index={i} total={TAG_CHARS.length} progress={progress} />
        ))}
      </View>
    </View>
  );
});

const TypewriterChar = memo(function TypewriterChar({ char, index, total, progress }: { char: string; index: number; total: number; progress: Animated.SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    // map progress 0..1 to typewriter
    const tw = progress.value;
    const charP = index / total;
    const visible = tw > charP ? 1 : 0;
    return { opacity: visible };
  });
  return <Animated.Text style={[styles.tagChar, style]}>{char}</Animated.Text>;
});

/* Job card — liquid glass with staggered entrance */
const JobSlide = memo(function JobSlide({ job, i, sp }: { job: typeof JOBS[number]; i: number; sp: Animated.SharedValue<number> }) {
  const card = useAnimatedStyle(() => {
    const d = i * 0.28;
    const l = Math.max(0, Math.min(1, (sp.value - d) / 0.45));
    const ease = l * l * (3 - 2 * l);
    return {
      opacity: ease,
      transform: [{ translateY: (1 - ease) * 36 }],
    };
  });
  const bar = useAnimatedStyle(() => {
    const d = i * 0.28 + 0.25;
    const l = Math.max(0, Math.min(1, (sp.value - d) / 0.35));
    const e = l * l * (3 - 2 * l);
    return { width: `${job.pct * e}%` as any };
  });
  return (
    <Animated.View style={[styles.jobCard, card]}>
      {/* glass layers */}
      <View style={styles.glassBase} />
      <View style={[styles.glassSheen, { borderColor: `${job.accent}18` }]} />
      <View style={[styles.accentGlow, { backgroundColor: job.accent }]} />

      {/* content */}
      <View style={styles.jobContent}>
        <View style={styles.jobRow}>
          <View style={[styles.iconWrap, { borderColor: `${job.accent}30` }]}>
            <Text style={styles.iconEmoji}>{job.emoji}</Text>
          </View>
          <View style={styles.jobBody}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobDesc}>{job.desc}</Text>
          </View>
          <Text style={[styles.jobPct, { color: job.accent }]}>{job.pct}%</Text>
        </View>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { backgroundColor: job.accent }, bar]} />
        </View>
      </View>
    </Animated.View>
  );
});

/* ════════════════════════════════════════════════
   MAIN
   ════════════════════════════════════════════════ */
export default function OceanPersonalityCard() {
  const particles = useMemo(mkP, []);
  const master = useSharedValue(0);
  const clock = useSharedValue(0);

  useEffect(() => {
    master.value = withTiming(1, { duration: DUR * 1000, easing: Easing.linear });
    clock.value = withRepeat(withTiming(100000, { duration: 100000000, easing: Easing.linear }), -1, false);
    return () => { cancelAnimation(master); cancelAnimation(clock); };
  }, [master, clock]);

  /* scroll: 3 page transitions using individual delayed animations */
  const scroll1 = useSharedValue(0); // hook→pain
  const scroll2 = useSharedValue(0); // pain→radar
  const scroll3 = useSharedValue(0); // radar→results
  useEffect(() => {
    scroll1.value = withDelay(G.hookOut * 1000, withTiming(1, { duration: 1200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }));
    scroll2.value = withDelay(G.painOut * 1000, withTiming(1, { duration: 1200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }));
    scroll3.value = withDelay(G.lock * 1000, withTiming(1, { duration: 1400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }));
    return () => { cancelAnimation(scroll1); cancelAnimation(scroll2); cancelAnimation(scroll3); };
  }, [scroll1, scroll2, scroll3]);

  /* derived scene progress values */
  const birthP  = useDerivedValue(() => Math.min(1, (master.value * DUR) / G.birth));
  const radarP  = useDerivedValue(() => { const t = master.value * DUR; return t < G.birth  ? 0 : Math.min(1, (t - G.birth)  / (G.radar  - G.birth));  });
  const fillP   = useDerivedValue(() => { const t = master.value * DUR; return t < G.radar  ? 0 : Math.min(1, (t - G.radar)  / (G.fill   - G.radar));  });
  const lockP   = useDerivedValue(() => { const t = master.value * DUR; return t < G.fill   ? 0 : Math.min(1, (t - G.fill)   / (G.lock   - G.fill));   });
  const scrollP = useDerivedValue(() => { const t = master.value * DUR; return t < G.lock   ? 0 : Math.min(1, (t - G.lock)   / (G.scroll - G.lock));   });
  const headerP = useDerivedValue(() => { const t = master.value * DUR; return t < G.scroll ? 0 : Math.min(1, (t - G.scroll) / (G.header - G.scroll)); });
  const jobsP   = useDerivedValue(() => { const t = master.value * DUR; return t < G.header ? 0 : Math.min(1, (t - G.header) / (G.jobs   - G.header)); });
  const tagP    = useDerivedValue(() => { const t = master.value * DUR; return t < G.jobs   ? 0 : Math.min(1, (t - G.jobs)   / (G.tag    - G.jobs));   });

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
    ), -1, false);
    return () => cancelAnimation(pulse);
  }, [pulse]);

  /* data polygon — staggered per-vertex for organic feel */
  const STAGGER = [0, 0.12, 0.06, 0.18, 0.09]; // each vertex delays differently
  const EASE_POW = [2.2, 1.8, 2.5, 1.6, 2.8]; // each vertex curves differently
  const polyP = useAnimatedProps(() => {
    const f = fillP.value;
    const pts: string[] = [];
    for (let j = 0; j < 5; j++) {
      const local = Math.max(0, Math.min(1, (f - STAGGER[j]) / (1 - STAGGER[j])));
      const eased = 1 - Math.pow(1 - local, EASE_POW[j]); // varied ease-out
      const r = R * VALUES[j] * eased;
      pts.push(`${px(j, r)},${py(j, r)}`);
    }
    return { points: pts.join(' ') };
  });

  /* glow follows same stagger */
  const polyGlowP = useAnimatedProps(() => {
    const f = fillP.value;
    const p = pulse.value;
    const glowOp = f > 0.5 ? (0.08 + p * 0.12) * Math.min(1, (f - 0.5) * 4) : 0;
    const pts: string[] = [];
    for (let j = 0; j < 5; j++) {
      const local = Math.max(0, Math.min(1, (f - STAGGER[j]) / (1 - STAGGER[j])));
      const eased = 1 - Math.pow(1 - local, EASE_POW[j]);
      const r = R * VALUES[j] * eased;
      pts.push(`${px(j, r)},${py(j, r)}`);
    }
    return { points: pts.join(' '), opacity: glowOp };
  });

  /* radar subtle scale during lock */
  const radarPulse = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + lockP.value * 0.018 }],
  }));

  /* continuous scroll: move the entire tall column upward */
  const scrollStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -(scroll1.value + scroll2.value + scroll3.value) * SCREEN_H }],
  }));

  /* page visibility gates */
  const painVis = useAnimatedStyle(() => ({
    opacity: scroll1.value > 0.01 ? 1 : 0,
  }));
  const radarVis = useAnimatedStyle(() => ({
    opacity: scroll2.value > 0.01 ? 1 : 0,
  }));
  const resultsVis = useAnimatedStyle(() => ({
    opacity: scroll3.value > 0.01 ? 1 : 0,
  }));

  /* header and jobs fade in during/after scroll */
  const headerFade = useAnimatedStyle(() => {
    const h = headerP.value;
    const smooth = h * h * (3 - 2 * h);
    return {
      opacity: smooth,
      transform: [{ translateY: (1 - smooth) * 60 }],
    };
  });

  /* tagline fades in after last job card — unused, replaced by typewriter */

  const spokes = useMemo(() => LABELS.map((_, i) => ({ ex: px(i, R), ey: py(i, R) })), []);
  const grids  = useMemo(() => [pent(R * 0.5), pent(R)], []);

  return (
    <View style={styles.root}>
      {/* ocean background + particles */}
      <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${VB} ${VB * 1.75}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="bg" cx="50%" cy="32%" r="82%">
            <Stop offset="0%" stopColor="#072F55" />
            <Stop offset="50%" stopColor="#021A38" />
            <Stop offset="100%" stopColor="#010B18" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={VB} height={VB * 1.75} fill="url(#bg)" />
        {particles.map((p, i) => <Dot key={i} p={p} clk={clock} />)}
      </Svg>

      {/* scrolling column — four pages stacked */}
      <Animated.View style={[styles.scrollCol, scrollStyle]}>
        {/* page 0: hook */}
        <View style={styles.page}>
          <IntroHook />
        </View>

        {/* page 1: pain / overwhelm */}
        <Animated.View style={[styles.page, painVis]}>
          <IntroPain master={master} />
        </Animated.View>

        {/* page 2: radar chart */}
        <Animated.View style={[styles.page, radarVis]}>
          <View style={[styles.titleWrap]}>
            <Text style={styles.titleT}>Your Personality</Text>
          </View>
          <Animated.View style={[styles.radar, radarPulse]}>
            <Svg width="100%" height="100%" viewBox={`0 0 ${VB} ${VB}`}>
              <Defs>
                <RadialGradient id="cg" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#85B7EB" />
                  <Stop offset="100%" stopColor="#85B7EB" stopOpacity="0" />
                </RadialGradient>
                <LinearGradient id="pf" x1="25%" y1="0%" x2="75%" y2="100%">
                  <Stop offset="0%" stopColor="#85B7EB" stopOpacity="0.12" />
                  <Stop offset="50%" stopColor="#A8D4FF" stopOpacity="0.28" />
                  <Stop offset="100%" stopColor="#85B7EB" stopOpacity="0.1" />
                </LinearGradient>
                <LinearGradient id="ps" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#85B7EB" stopOpacity="0.7" />
                  <Stop offset="50%" stopColor="#A8D4FF" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#85B7EB" stopOpacity="0.7" />
                </LinearGradient>
              </Defs>

              {[0,1,2,3,4,5].map(i => <Sonar key={i} i={i} p={birthP} />)}

              {grids.map((pts, r) => (
                <GridEl key={r} pts={pts} ring={r} p={radarP}
                  maxOp={r === 1 ? 0.5 : 0.15}
                  sw={r === 1 ? 1.2 : 0.4}
                />
              ))}
              {spokes.map((s, i) => <SpokeEl key={i} i={i} ex={s.ex} ey={s.ey} p={radarP} />)}

              <AnimatedPolygon animatedProps={polyP} fill="url(#pf)" stroke="url(#ps)" strokeWidth={1.2} strokeLinejoin="round" />
              <AnimatedPolygon animatedProps={polyGlowP} fill="#85B7EB" stroke="none" strokeLinejoin="round"
                {...(Platform.OS === 'web' ? { style: { filter: 'blur(18px)' } } as any : {})} />

              {LABELS.map((l, i) => <Lbl key={l} i={i} label={l} letter={LETTERS[i]} p={radarP} />)}
            </Svg>
          </Animated.View>
        </Animated.View>

        {/* page 3: results — scrolls into view */}
        <Animated.View style={[styles.page, resultsVis]}>
          <View style={styles.headerWrap}>
            <Text style={styles.headerT}>You'd be successful in:</Text>
          </View>
          <View style={styles.jobWrap}>
            {JOBS.map((j, i) => <JobSlide key={j.title} job={j} i={i} sp={jobsP} />)}
          </View>
          <TypewriterTag progress={tagP} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const RADAR_SIZE = Math.min(SCREEN_W * 0.88, 380);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#010B18', overflow: 'hidden' },
  scrollCol: { position: 'absolute', top: 0, left: 0, right: 0 },
  page: { width: '100%', height: SCREEN_H, justifyContent: 'center', alignItems: 'center' },
  introCenter: { justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' as any },
  hookBold: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', letterSpacing: 1, textAlign: 'center', lineHeight: 38, fontFamily: sans ?? undefined },
  painChip: { position: 'absolute', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(133,183,235,0.15)', backgroundColor: 'rgba(133,183,235,0.06)' },
  painChipText: { color: 'rgba(133,183,235,0.7)', fontSize: 15, fontWeight: '400', letterSpacing: 0.5, fontFamily: sans ?? undefined },
  radar: { width: RADAR_SIZE, aspectRatio: 1 },

  titleWrap: { alignItems: 'center', marginBottom: 8 },
  titleT: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '400', letterSpacing: 5, textTransform: 'uppercase', fontFamily: sans ?? undefined },

  headerWrap: { alignItems: 'center', marginBottom: 24 },
  headerT: { color: 'rgba(255,255,255,0.85)', fontSize: 22, fontWeight: '300', letterSpacing: 4, fontFamily: sans ?? undefined },

  tagWrap: { marginTop: 28, alignItems: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 280 },
  tagBreak: { width: '100%' as any, height: 0 },
  tagChar: { color: 'rgba(133,183,235,0.5)', fontSize: 13, fontWeight: '400', fontStyle: 'italic', letterSpacing: 1.2, lineHeight: 20, fontFamily: sans ?? undefined },

  jobWrap: { width: Math.min(SCREEN_W * 0.88, 380), gap: 14 },
  jobCard: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  glassBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(24px) saturate(1.4)', WebkitBackdropFilter: 'blur(24px) saturate(1.4)' } as any : {}),
  },
  glassSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    // top highlight
    ...(Platform.OS === 'web' ? { backgroundImage: 'linear-gradient(168deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0) 100%)' } as any : {}),
  },
  accentGlow: {
    position: 'absolute',
    bottom: -8,
    left: '20%' as any,
    right: '20%' as any,
    height: 18,
    borderRadius: 9,
    opacity: 0.08,
    ...(Platform.OS === 'web' ? { filter: 'blur(14px)' } as any : {}),
  },
  jobContent: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 11,
  },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  iconEmoji: { fontSize: 19 },
  jobBody: { flex: 1, gap: 3 },
  jobTitle: { color: 'rgba(255,255,255,0.92)', fontSize: 15, fontWeight: '600', letterSpacing: 0.1, fontFamily: sans ?? undefined },
  jobDesc: { color: 'rgba(133,183,235,0.45)', fontSize: 11, fontFamily: sans ?? undefined, letterSpacing: 0.2 },
  jobPct: { fontSize: 16, fontWeight: '700', fontFamily: mono ?? undefined },
  barTrack: { height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  barFill: { height: 3, borderRadius: 1.5, opacity: 0.55 },
});
