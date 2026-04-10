import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type EchoStackCardProps = {
  title: string;
  description: string;
  tagA: string;
  tagB: string;
};

export function EchoStackCard({ title, description, tagA, tagB }: EchoStackCardProps) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [drift]);

  const layerOne = useAnimatedStyle(() => {
    const y = interpolate(drift.value, [0, 1], [0, -8]);
    const r = interpolate(drift.value, [0, 1], [0, -4]);
    return { transform: [{ translateY: y }, { rotate: `${r}deg` }] };
  });

  const layerTwo = useAnimatedStyle(() => {
    const y = interpolate(drift.value, [0, 1], [0, 6]);
    const r = interpolate(drift.value, [0, 1], [0, 5]);
    return { transform: [{ translateY: y }, { rotate: `${r}deg` }] };
  });

  return (
    <View style={styles.card}>
      <View style={styles.stackWrap}>
        <Animated.View style={[styles.layer, styles.layerBack, layerTwo]} />
        <Animated.View style={[styles.layer, styles.layerMid, layerOne]} />
        <View style={[styles.layer, styles.layerFront]}>
          <View style={styles.dot} />
          <Text style={styles.faceTitle}>{title}</Text>
          <Text style={styles.faceCaption}>{description}</Text>
        </View>
      </View>

      <View style={styles.tagRow}>
        <Text style={styles.tag}>{tagA}</Text>
        <Text style={styles.tag}>{tagB}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 250,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#FFF8F2',
    borderWidth: 1,
    borderColor: '#F1DDCA',
    gap: 16,
  },
  stackWrap: {
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    width: 190,
    height: 120,
    borderRadius: 20,
    position: 'absolute',
    borderWidth: 1,
  },
  layerBack: {
    backgroundColor: '#FAD5B3',
    borderColor: '#E6BE99',
  },
  layerMid: {
    backgroundColor: '#F7CDA5',
    borderColor: '#DFB58F',
  },
  layerFront: {
    backgroundColor: '#2C1E1A',
    borderColor: '#4B312A',
    padding: 14,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFBA73',
  },
  faceTitle: {
    color: '#FFE8D4',
    fontSize: 18,
    fontWeight: '700',
  },
  faceCaption: {
    color: '#E6CDB8',
    fontSize: 13,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FCE4CF',
    color: '#925C36',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
