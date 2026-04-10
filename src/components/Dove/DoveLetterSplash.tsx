import { memo, useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';

type Props = {
  size?: number;
  backgroundColor?: string;
  strokeColor?: string;
  showMessage?: boolean;
  message?: string;
};

function DoveLetterSplash({
  size = 320,
  backgroundColor = '#F7F7F5',
  strokeColor = '#2E2A27',
  showMessage = false,
  message = 'A message is on its way.',
}: Props) {
  const cycle = useSharedValue(0);
  const wing = useSharedValue(0);

  useEffect(() => {
    cycle.value = withRepeat(
      withTiming(1, {
        duration: 5200,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      false,
    );

    wing.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 360, easing: Easing.in(Easing.cubic) }),
      ),
      -1,
      false,
    );
  }, [cycle, wing]);

  const doveStyle = useAnimatedStyle(() => {
    const x = interpolate(cycle.value, [0, 0.44, 0.58, 1], [-108, 14, 14, -108], 'clamp');
    const y = interpolate(cycle.value, [0, 0.44, 0.58, 1], [3, 0, 0, 2], 'clamp');
    const tilt = interpolate(cycle.value, [0, 0.44, 0.58, 1], [-2, 2, 2, -2], 'clamp');

    return {
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${tilt}deg` }],
    };
  });

  const wingStyle = useAnimatedStyle(() => {
    const lift = interpolate(wing.value, [0, 1], [0, -7]);
    const flap = interpolate(wing.value, [0, 1], [0, -11]);

    return {
      transform: [{ translateY: lift }, { rotate: `${flap}deg` }],
    };
  });

  const letterStyle = useAnimatedStyle(() => {
    const x = interpolate(cycle.value, [0, 0.5, 0.58, 1], [224, 224, 178, 74], 'clamp');
    const y = interpolate(cycle.value, [0, 0.5, 0.58, 1], [138, 138, 114, 102], 'clamp');
    const r = interpolate(cycle.value, [0, 0.5, 0.58, 1], [-12, -12, -6, 6], 'clamp');

    return {
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${r}deg` }],
    };
  });

  const doveBodyWidth = size * 0.45;
  const doveBodyHeight = doveBodyWidth * 0.48;
  const canvasHeight = size * 0.62;

  return (
    <View style={[styles.wrap, { backgroundColor }]}> 
      <View style={[styles.canvas, { width: size, height: canvasHeight }]}> 
        <View style={styles.handWrap}>
          <Svg width={148} height={116} viewBox="0 0 148 116">
            <Path
              d="M12 82 C34 75, 52 68, 72 64 C91 60, 101 55, 117 45 C126 39, 132 45, 125 52 C115 63, 102 69, 86 74 C72 78, 54 84, 34 93"
              fill="none"
              stroke={strokeColor}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            <Path
              d="M32 92 L56 110 L103 110 L80 86"
              fill="none"
              stroke={strokeColor}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            <Line x1="60" y1="94" x2="67" y2="106" stroke={strokeColor} strokeWidth={1.6} strokeLinecap="round" />
            <Line x1="68" y1="91" x2="75" y2="106" stroke={strokeColor} strokeWidth={1.6} strokeLinecap="round" />
            <Line x1="76" y1="89" x2="83" y2="106" stroke={strokeColor} strokeWidth={1.6} strokeLinecap="round" />
          </Svg>
        </View>

        <Animated.View style={[styles.letterWrap, letterStyle]}>
          <Svg width={58} height={44} viewBox="0 0 58 44">
            <Path d="M5 6 L53 6 L53 38 L5 38 Z" fill="#F2F1EC" stroke={strokeColor} strokeWidth={2} />
            <Path d="M5 8 L29 23 L53 8" fill="none" stroke={strokeColor} strokeWidth={2} strokeLinejoin="round" />
          </Svg>
        </Animated.View>

        <Animated.View style={[styles.doveWrap, doveStyle]}>
          <Animated.View style={[styles.wingLayer, wingStyle]}>
            <Svg width={88} height={52} viewBox="0 0 88 52">
              <Path
                d="M80 46 C56 34, 40 24, 20 10 C12 5, 8 9, 12 16 C20 29, 34 39, 56 47"
                fill="none"
                stroke={strokeColor}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Line x1="52" y1="34" x2="34" y2="25" stroke={strokeColor} strokeWidth={1.7} strokeLinecap="round" />
              <Line x1="45" y1="39" x2="27" y2="31" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
              <Line x1="60" y1="29" x2="42" y2="19" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" />
            </Svg>
          </Animated.View>

          <Svg width={doveBodyWidth} height={doveBodyHeight} viewBox="0 0 164 84">

            <Path
              d="M20 58 C38 44, 62 38, 94 40 C118 42, 133 34, 146 24 C152 20, 157 23, 155 28 C149 42, 132 53, 116 59 C99 66, 83 67, 66 65 C46 63, 31 62, 20 58 Z"
              fill="none"
              stroke={strokeColor}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8 58 C16 52, 17 48, 14 42 C22 44, 28 48, 31 55"
              fill="none"
              stroke={strokeColor}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            <Path d="M145 26 L160 23 L148 35 Z" fill={strokeColor} />
            <Path d="M129 50 L151 56" fill="none" stroke={strokeColor} strokeWidth={2.1} strokeLinecap="round" />
          </Svg>
        </Animated.View>
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
    padding: 28,
    gap: 18,
  },
  canvas: {
    position: 'relative',
    maxWidth: '100%',
  },
  handWrap: {
    position: 'absolute',
    right: -2,
    bottom: 0,
  },
  letterWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  doveWrap: {
    position: 'absolute',
    left: 0,
    top: 40,
  },
  wingLayer: {
    position: 'absolute',
    left: 2,
    top: -8,
  },
  message: {
    color: '#3C3936',
    fontSize: 24,
    lineHeight: 38,
    textAlign: 'center',
    letterSpacing: 0.6,
    fontFamily: Platform.select({
      web: '"Cormorant Garamond", serif',
      default: 'serif',
    }),
  },
});

export default memo(DoveLetterSplash);
