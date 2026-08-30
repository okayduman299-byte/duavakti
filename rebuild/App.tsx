import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

/**
 * Stable startup baseline.
 *
 * The previous release still crashed before the UI became usable. This build
 * intentionally starts with only React Native primitives. No GPS, storage,
 * notifications, widgets, API calls, navigation components, or custom hooks
 * are imported during bootstrap. Once this baseline is confirmed stable on
 * the device, features can be restored one at a time.
 */
export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#080a0b" />
      <Text style={styles.title}>DuaVakti</Text>
      <Text style={styles.subtitle}>Stabilite testi başarılı.</Text>
      <Text style={styles.detail}>Bu sürüm yalnızca uygulamanın açılışını test eder.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080a0b', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#ffffff', fontSize: 42, fontWeight: '800', marginBottom: 12 },
  subtitle: { color: '#ffffff', fontSize: 20, fontWeight: '600', marginBottom: 10 },
  detail: { color: '#aeb4b8', fontSize: 15, textAlign: 'center' },
});
