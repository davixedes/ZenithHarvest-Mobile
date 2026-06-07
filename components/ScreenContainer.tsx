import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';

import { useColors } from '@/hooks/useColors';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
}

export function ScreenContainer({ children, style, ...rest }: ScreenContainerProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        Platform.OS === 'web' && styles.webContainer,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webContainer: StyleSheet.absoluteFill,
});
