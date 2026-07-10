import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  resetKey?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? (error.message || error.name || 'Bilinmeyen bir ekran hatası oluştu.') : String(error || 'Bilinmeyen bir ekran hatası oluştu.'),
    };
  }

  componentDidUpdate(prevProps: Props): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, message: '' });
    }
  }

  componentDidCatch(error: Error): void {
    console.error('DuaVakti UI error:', error);
    if (!this.state.message) {
      this.setState({ message: error.message || error.name || String(error) });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Bu bölüm açılırken bir sorun oluştu.</Text>
        <Text style={styles.text}>Diğer bölümler çalışmaya devam ediyor. Bu bölümü yeniden başlatabilirsin.</Text>
        {this.state.message ? <Text style={styles.detail}>Teknik bilgi: {this.state.message}</Text> : null}
        <Pressable style={styles.button} onPress={() => this.setState({ hasError: false, message: '' })}>
          <Text style={styles.buttonText}>Bölümü yeniden aç</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm },
  text: { color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: spacing.md },
  detail: { color: colors.warning, fontSize: 11, lineHeight: 16, textAlign: 'center', marginBottom: spacing.lg },
  button: { backgroundColor: colors.accentSoft, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: 18, paddingVertical: 12 },
  buttonText: { color: colors.text, fontWeight: '700' },
});
