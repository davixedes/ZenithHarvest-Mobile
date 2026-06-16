import React, { useEffect, useState } from 'react';
import { Animated, Platform, ViewStyle } from 'react-native';

import { radius } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width, height = 16, borderRadius = radius.sm, style }: Props) {
  const colors = useColors();
  const [opacity] = useState(() => new Animated.Value(0.45));

  useEffect(() => {
    const nativeDriver = Platform.OS !== 'web';
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: nativeDriver }),
        Animated.timing(opacity, { toValue: 0.45, duration: 800, useNativeDriver: nativeDriver }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as ViewStyle['width'],
          height,
          borderRadius,
          backgroundColor: colors.surfaceSecondary,
          opacity,
        },
        style,
      ]}
    />
  );
}
