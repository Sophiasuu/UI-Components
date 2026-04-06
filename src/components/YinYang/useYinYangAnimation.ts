import { useEffect } from 'react';
import {
  Easing,
  Extrapolation,
  interpolate,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type UseYinYangAnimationOptions = {
  autoplay?: boolean;
  sequenceDuration?: number;
  finalRotationDuration?: number;
  sequenceKey?: number;
};

export function useYinYangAnimation({
  autoplay = true,
  sequenceDuration = 7600,
  finalRotationDuration = 8400,
  sequenceKey = 0,
}: UseYinYangAnimationOptions) {
  const sequenceProgress = useSharedValue(0);
  const orbitAngle = useSharedValue(0);
  const breathing = useSharedValue(0);
  const fluidPhase = useSharedValue(0);
  const finalRotation = useSharedValue(0);

  useEffect(() => {
    if (!autoplay) return;

    // reset
    sequenceProgress.value = 0;
    orbitAngle.value = 0;
    breathing.value = 0;

    /** 🌿 MAIN SEQUENCE (slow start, strong finish) */
    sequenceProgress.value = withTiming(1, {
      duration: sequenceDuration,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });

    /** 🔁 ORBIT MOTION (slows slightly near merge) */
    orbitAngle.value = withTiming(Math.PI * 4.2, {
      duration: sequenceDuration,
      easing: Easing.linear,
    });

    /** 🌬️ BREATHING */
    breathing.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: 2600,
          easing: Easing.inOut(Easing.quad),
        })
      ),
      -1,
      false
    );

    /** 🌊 FLUID PHASE */
    fluidPhase.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 7000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    /** 🔄 FINAL ROTATION */
    finalRotation.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: finalRotationDuration,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [
    autoplay,
    sequenceDuration,
    finalRotationDuration,
    sequenceKey,
  ]);

  /**
   * 🔁 ORBIT RADIUS
   * Key improvement: "magnetic pull"
   */
  const orbitRadiusFactor = useDerivedValue(() => {
    const p = sequenceProgress.value;

    // hold orbit longer, then accelerate inward
    const merge = interpolate(
      p,
      [0.0, 0.55, 0.75, 1.0],
      [0, 0, 0.4, 1],
      Extrapolation.CLAMP
    );

    return 1 - merge;
  });

  /**
   * 🔍 DEPTH SCALE
   */
  const orbitScale = useDerivedValue(() => {
    return interpolate(
      sequenceProgress.value,
      [0.0, 0.3, 0.6, 1.0],
      [0.88, 0.88, 0.9, 1],
      Extrapolation.CLAMP
    );
  });

  /**
   * 💓 BREATHING SCALE
   */
  const pulseScale = useDerivedValue(() => {
    return interpolate(
      breathing.value,
      [0, 1],
      [0.992, 1.008],
      Extrapolation.CLAMP
    );
  });

  /**
   * 🌊 FLUID ACTIVATION
   */
  const fluidAmplitude = useDerivedValue(() => {
    const reveal = interpolate(
      sequenceProgress.value,
      [0.72, 1.0],
      [0, 1],
      Extrapolation.CLAMP
    );

    return 2.2 * reveal;
  });

  /**
   * 🔄 FINAL ROTATION HANDOFF
   */
  const rotationAngle = useDerivedValue(() => {
    const blend = interpolate(
      sequenceProgress.value,
      [0.65, 1.0],
      [0, 1],
      Extrapolation.CLAMP
    );

    return finalRotation.value * blend;
  });

  return {
    sequenceProgress,
    orbitAngle,
    orbitRadiusFactor,
    orbitScale,
    pulseScale,
    fluidPhase,
    fluidAmplitude,
    rotationAngle,
  };
}