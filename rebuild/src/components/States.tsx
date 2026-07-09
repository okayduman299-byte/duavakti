import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme';

export function LoadingState({ label = 'Yükleniyor…' }: { label?: string }) {
  return (
    <View style={styles.root}>
      <ActivityIndicator size="small" color={colors.accent} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export function ErrorState({ title, detail, onRetry }: { title: string; detail?: string; onRetry?: () => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.text}>{detail}</Text> : null}
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Tekrar dene</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', paddingVertical: 36, gap: 10 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg, padding: spacing.lg, marginVertical: spacing.md },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  text: { color: colors.textMuted, lineHeight: 21 },
  button: { alignSelf: 'flex-start', marginTop: 14, backgroundColor: colors.accentSoft, borderRadius: radii.sm, paddingHorizontal: 14, paddingVertical: 10 },
  buttonText: { color: colors.text, fontWeight: '700' },
});
