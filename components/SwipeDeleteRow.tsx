import React, { useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { Swipeable } from 'react-native-gesture-handler';

import { radius, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

interface SwipeDeleteRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
  enabled?: boolean;
}

export function SwipeDeleteRow({
  children,
  onDelete,
  deleteLabel = 'Remover',
  enabled = true,
}: SwipeDeleteRowProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const swipeRef = useRef<Swipeable>(null);

  if (!enabled) {
    return <>{children}</>;
  }

  function renderRightActions(
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) {
    const scale = dragX.interpolate({
      inputRange: [-88, 0],
      outputRange: [1, 0.75],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.actionWrap, { transform: [{ scale }] }]}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            swipeRef.current?.close();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel={deleteLabel}
        >
          <Ionicons name="trash-outline" size={22} color={colors.textOnPrimary} />
          <Text style={styles.actionText}>{deleteLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Swipeable ref={swipeRef} friction={2} overshootRight={false} renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    actionWrap: {
      width: 88,
      marginLeft: spacing.sm,
      justifyContent: 'center',
    },
    actionBtn: {
      flex: 1,
      backgroundColor: c.danger,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
    },
    actionText: { ...typography.micro, color: c.textOnPrimary },
  });
}
