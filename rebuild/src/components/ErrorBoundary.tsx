import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('DuaVakti UI error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Bu bölüm açılırken bir sorun oluştu.</Text>
        <Text style={styles.text}>Uygulama kapanmadı. Bölümü güvenle yeniden başlatabilirsin.</Text>
        <Pressable style={styles.button} onPress={() => this.setState({ hasError: false })}>
          <Text style={styles.buttonText}>Bölümü yeniden aç</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm },
  text: { color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: spacing.lg },
  button: { backgroundColor: colors.accentSoft, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: 18, paddingVertical: 12 },
  buttonText: { color: colors.text, fontWeight: '700' },
});
