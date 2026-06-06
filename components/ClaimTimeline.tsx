import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { radius, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { CLAIM_SITUATION } from '@/services/claimService';

const TIMELINE_IDS = [1, 2, 3, 5] as const;

interface ClaimTimelineProps {
  situationId: number;
}

export function ClaimTimeline({ situationId }: ClaimTimelineProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isRejected = situationId === 4;
  const currentIdx = isRejected ? 2 : TIMELINE_IDS.indexOf(situationId as (typeof TIMELINE_IDS)[number]);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentIdx < 0) return undefined;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.35, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [currentIdx, pulse]);

  return (
    <View style={styles.container} accessibilityLabel="Linha do tempo do sinistro">
      {TIMELINE_IDS.map((stepId, idx) => {
        const isCompleted = currentIdx > idx;
        const isCurrent = currentIdx === idx && !isRejected;
        const isRejectedStep = isRejected && idx === 2;
        const stepColor = isRejectedStep
          ? colors.danger
          : isCompleted || isCurrent
            ? colors.primary
            : colors.border;

        return (
          <View key={stepId} style={styles.step}>
            <View style={styles.leftColumn}>
              {isCurrent ? (
                <Animated.View
                  style={[
                    styles.pulseRing,
                    {
                      borderColor: colors.primary,
                      transform: [{ scale: pulse }],
                      opacity: pulse.interpolate({
                        inputRange: [1, 1.35],
                        outputRange: [0.55, 0],
                      }),
                    },
                  ]}
                />
              ) : null}
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isCompleted || isCurrent || isRejectedStep ? stepColor : colors.surface,
                    borderColor: stepColor,
                  },
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={12} color={colors.textOnPrimary} />
                ) : isRejectedStep ? (
                  <Ionicons name="close" size={12} color={colors.textOnPrimary} />
                ) : null}
              </View>
              {idx < TIMELINE_IDS.length - 1 ? (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: isCompleted ? colors.primary : colors.border },
                  ]}
                />
              ) : null}
            </View>

            <View style={styles.content}>
              <Text
                style={[
                  styles.label,
                  (isCompleted || isCurrent || isRejectedStep) && { color: colors.text, fontWeight: '600' },
                ]}
              >
                {isRejectedStep ? 'Reprovado' : CLAIM_SITUATION[stepId]}
              </Text>
              {isCurrent ? (
                <Text style={[styles.hint, { color: colors.primary }]}>Etapa atual</Text>
              ) : isRejectedStep ? (
                <Text style={[styles.hint, { color: colors.danger }]}>Processo encerrado</Text>
              ) : isCompleted ? (
                <Text style={[styles.hint, { color: colors.textMuted }]}>Concluído</Text>
              ) : (
                <Text style={[styles.hint, { color: colors.textLight }]}>Aguardando</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { gap: 0 },
    step: { flexDirection: 'row', minHeight: 72 },
    leftColumn: {
      width: 32,
      alignItems: 'center',
      position: 'relative',
    },
    pulseRing: {
      position: 'absolute',
      top: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
    },
    dot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    connector: {
      width: 2,
      flex: 1,
      minHeight: 36,
      marginVertical: 4,
      borderRadius: radius.full,
    },
    content: {
      flex: 1,
      paddingLeft: spacing.sm,
      paddingTop: 2,
      gap: 2,
    },
    label: { ...typography.bodyBold, color: c.textMuted, fontSize: 14 },
    hint: { ...typography.caption },
  });
}
