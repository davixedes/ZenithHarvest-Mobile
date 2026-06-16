import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
  key: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  toast: ToastState | null;
  translateY: Animated.Value;
  opacity: Animated.Value;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  toast: null,
  translateY: new Animated.Value(80),
  opacity: new Animated.Value(0),
});

export function useToast() {
  const { showToast } = useContext(ToastContext);
  return { showToast };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [translateY] = useState(() => new Animated.Value(80));
  const [opacity] = useState(() => new Animated.Value(0));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyRef = useRef(0);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      if (timerRef.current) clearTimeout(timerRef.current);

      translateY.setValue(80);
      opacity.setValue(0);

      keyRef.current += 1;
      setToast({ message, type, key: keyRef.current });

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();

      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 80, duration: 250, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => setToast(null));
      }, 3200);
    },
    [translateY, opacity]
  );

  return (
    <ToastContext.Provider value={{ showToast, toast, translateY, opacity }}>
      {children}
    </ToastContext.Provider>
  );
}

// Render this once at root level, AFTER the Stack navigator, so it renders on top.
export function ToastHost() {
  const { toast, translateY, opacity } = useContext(ToastContext);
  const colors = useColors();
  const insets = useSafeAreaInsets();

  if (!toast) return null;

  const config: Record<
    ToastType,
    {
      bg: string;
      iconName: React.ComponentProps<typeof Ionicons>['name'];
      color: string;
      border: string;
    }
  > = {
    success: {
      bg: colors.successBg,
      iconName: 'checkmark-circle',
      color: colors.success,
      border: colors.success,
    },
    error: {
      bg: colors.dangerBg,
      iconName: 'close-circle',
      color: colors.danger,
      border: colors.danger,
    },
    warning: {
      bg: colors.warningBg,
      iconName: 'warning',
      color: colors.warning,
      border: colors.warning,
    },
    info: {
      bg: colors.infoBg,
      iconName: 'information-circle',
      color: colors.info,
      border: colors.info,
    },
  };

  const { bg, iconName, color, border } = config[toast.type];

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { bottom: insets.bottom + spacing.lg, opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.toast, { backgroundColor: bg, borderColor: border }]}>
        <Ionicons name={iconName} size={20} color={color} />
        <Text style={[styles.message, { color }]}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    ...shadow.md,
  },
  message: {
    ...typography.bodyBold,
    flex: 1,
    fontSize: 14,
  },
});
