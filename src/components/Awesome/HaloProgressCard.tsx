import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type HaloProgressCardProps = {
  value: number;
  title: string;
  subtitle: string;
};

const SIZE = 162;
const STROKE = 13;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function HaloProgressCard({ value, title, subtitle }: HaloProgressCardProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(100, value));
    progress.value = withTiming(clamped / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, value]);

  const ringProps = useAnimatedProps(() => {
    const strokeDashoffset = interpolate(progress.value, [0, 1], [CIRCUMFERENCE, 0]);
    return { strokeDashoffset };
  });

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Signal Strength</Text>
      <View style={styles.ringWrap}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="rgba(41, 56, 70, 0.2)"
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#4AD6B9"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
            animatedProps={ringProps}
            fill="none"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={styles.valueCenter}>
          <Text style={styles.valueText}>{Math.round(Math.max(0, Math.min(100, value)))}</Text>
          <Text style={styles.percent}>%</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 250,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#F5FAFA',
    borderWidth: 1,
    borderColor: '#D4E8E6',
    gap: 10,
  },
  kicker: {
    fontSize: 11,
    color: '#37645D',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  ringWrap: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: -2,
  },
  valueText: {
    fontSize: 36,
    color: '#143430',
    fontWeight: '800',
    lineHeight: 40,
  },
  percent: {
    fontSize: 16,
    color: '#2B645B',
    fontWeight: '700',
    marginTop: 10,
    marginLeft: 2,
  },
  title: {
    fontSize: 19,
    color: '#173532',
    fontWeight: '700',
  },
  subtitle: {
    color: '#426862',
    fontSize: 14,
    lineHeight: 21,
  },
});
