import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

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
  const shimmer = useRef(new Animated.Value(0)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animation.current = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      })
    );
    animation.current.start();
    return () => animation.current?.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-320, 320],
  });

  return (
    <View
      style={[
        {
          width: width as ViewStyle['width'],
          height,
          borderRadius,
          backgroundColor: colors.surfaceSecondary,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={[colors.surfaceSecondary, colors.surface, colors.surfaceSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
