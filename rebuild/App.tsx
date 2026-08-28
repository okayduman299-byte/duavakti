import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { BottomNav } from './src/components/BottomNav';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LoadingState } from './src/components/States';
import { usePreferences } from './src/hooks/usePreferences';
import { usePrayerData } from './src/hooks/usePrayerData';
import { HomeScreen } from './src/screens/HomeScreen';
import { QuranScreen } from './src/screens/QuranScreen';
import { DuasScreen } from './src/screens/DuasScreen';
import { TesbihScreen } from './src/screens/TesbihScreen';
import { WidgetScreen } from './src/screens/WidgetScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors } from './src/theme';
import type { TabKey } from './src/types';

export default function App() {
  const [tab, setTab] = useState<TabKey>('home');
  const { preferences, update, ready } = usePreferences();
  const handleGpsEnabled = useCallback((enabled: boolean) => { update({ useGps: enabled }); }, [update]);
  const prayer = usePrayerData(preferences, handleGpsEnabled);

  // Native widget and notification synchronization are intentionally disabled
  // during startup. They will be re-enabled after the Android release is proven
  // stable. A native crash here must never take down the main application.
  useEffect(() => undefined, []);

  const screen = (() => {
    switch (tab) {
      case 'quran': return <QuranScreen preferences={preferences} updatePreferences={update} />;
      case 'duas': return <DuasScreen />;
      case 'tesbih': return <TesbihScreen />;
      case 'widget': return <WidgetScreen data={prayer.data} next={prayer.next} countdown={prayer.countdown} />;
      case 'settings': return <SettingsScreen preferences={preferences} updatePreferences={update} activeLocation={prayer.activeLocation} onRefresh={prayer.refresh} />;
      default: return <HomeScreen data={prayer.data} loading={prayer.loading} error={prayer.error} next={prayer.next} countdown={prayer.countdown} onRefresh={prayer.refresh} onLocate={() => void prayer.useCurrentLocation()} />;
    }
  })();

  return <View style={styles.root}><StatusBar barStyle="light-content" backgroundColor={colors.background} /><View style={styles.safeTop} /><View style={styles.screen}>{ready ? <ErrorBoundary key={tab} resetKey={tab}>{screen}</ErrorBoundary> : <LoadingState label="DuaVakti hazırlanıyor…" />}</View><BottomNav active={tab} onChange={setTab} /></View>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background }, safeTop: { height: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0 }, screen: { flex: 1 } });
