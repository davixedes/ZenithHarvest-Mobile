import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';

import { radius, shadow, spacing, typography } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import { analyseService, ChatMessage } from '@/services/analyseService';

const WELCOME: ChatMessage = {
  role: 'assistant',
  text: 'Olá! Sou o assistente Zenith. Posso ajudar com dúvidas sobre sua lavoura, sinistros, coberturas e análises satelitais. Como posso ajudar?',
};

export default function ChatScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<FlatList>(null);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError('');
    const userMsg: ChatMessage = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const resposta = await analyseService.chat(text);
      setMessages((prev) => [...prev, { role: 'assistant', text: resposta }]);
    } catch {
      setError('Não foi possível obter resposta. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title: 'Assistente IA', headerShown: true }} />
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
            <Text style={item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant}>
              {item.text}
            </Text>
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View style={styles.typingWrap}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.typingText}>Analisando…</Text>
            </View>
          ) : null
        }
      />

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Pergunte sobre sua lavoura…"
          placeholderTextColor={colors.textLight}
          multiline
          maxLength={1000}
          accessibilityLabel="Campo de mensagem"
          onSubmitEditing={send}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!input.trim() || loading}
          accessibilityLabel="Enviar mensagem"
        >
          <Ionicons name="send" size={20} color={colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: c.background },
    list: { flex: 1 },
    listContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.md },
    bubble: {
      maxWidth: '80%',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
    },
    bubbleUser: {
      alignSelf: 'flex-end',
      backgroundColor: c.primary,
      borderBottomRightRadius: 4,
    },
    bubbleAssistant: {
      alignSelf: 'flex-start',
      backgroundColor: c.surface,
      borderBottomLeftRadius: 4,
      ...shadow.sm,
    },
    bubbleTextUser: { ...typography.body, color: c.textOnPrimary, fontSize: 15 },
    bubbleTextAssistant: { ...typography.body, color: c.text, fontSize: 15 },
    typingWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    typingText: { ...typography.caption, color: c.textMuted },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: c.dangerBg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    errorText: { ...typography.caption, color: c.danger, flex: 1 },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.surface,
    },
    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 120,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: 15,
      color: c.text,
      backgroundColor: c.background,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: { opacity: 0.4 },
  });
}
