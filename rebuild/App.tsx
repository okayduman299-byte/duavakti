import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { loadPrayerTimes } from './src/lib/prayerService';
import { getNextPrayer } from './src/lib/prayer';
import { formatCountdown } from './src/lib/time';
import type { PrayerApiResult, PrayerKey } from './src/types';

const PRAYERS: Array<{ key: PrayerKey; label: string; icon: string }> = [
  { key: 'Fajr', label: 'İmsak', icon: '🌙' },
  { key: 'Dhuhr', label: 'Öğle', icon: '☀️' },
  { key: 'Asr', label: 'İkindi', icon: '🌤️' },
  { key: 'Maghrib', label: 'Akşam', icon: '🌅' },
  { key: 'Isha', label: 'Yatsı', icon: '🌌' },
];

export default function App() {
  const [data, setData] = useState<PrayerApiResult | null>(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadPrayerTimes(new Date(), {
        mode: 'city',
        label: 'Muradiye',
        city: 'Muradiye',
        country: 'Turkey',
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Namaz vakitleri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const next = useMemo(() => data ? getNextPrayer(now, data.timings) : null, [data, now]);
  const countdown = next ? formatCountdown(next.target.getTime() - now.getTime()) : '--:--:--';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#07110d" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>DuaVakti</Text>
            <Text style={styles.location}>📍 Muradiye • Türkiye</Text>
          </View>
          <Text style={styles.moon}>☪</Text>
        </View>

        <View style={styles.nextCard}>
          <Text style={styles.nextLabel}>SIRADAKİ VAKİT</Text>
          {loading && !data ? (
            <ActivityIndicator size="large" color="#a9d5b9" />
          ) : next ? (
            <>
              <Text style={styles.nextName}>{next.label}</Text>
              <Text style={styles.nextTime}>{next.time}</Text>
              <Text style={styles.countdown}>Kalan süre  {countdown}</Text>
            </>
          ) : (
            <Text style={styles.error}>{error ?? 'Vakit bulunamadı.'}</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Bugünün Namaz Vakitleri</Text>
        <View style={styles.list}>
          {PRAYERS.map((prayer) => {
            const isNext = next?.key === prayer.key;
            return (
              <View key={prayer.key} style={[styles.row, isNext && styles.nextRow]}>
                <Text style={styles.icon}>{prayer.icon}</Text>
                <Text style={styles.prayerName}>{prayer.label}</Text>
                <Text style={[styles.prayerTime, isNext && styles.nextPrayerTime]}>
                  {data?.timings[prayer.key] ?? '--:--'}
                </Text>
              </View>
            );
          })}
        </View>

        <Pressable style={styles.refreshButton} onPress={refresh} disabled={loading}>
          <Text style={styles.refreshText}>{loading ? 'Vakitler yükleniyor…' : '↻  Vakitleri Yenile'}</Text>
        </Pressable>

        {error && data ? <Text style={styles.smallError}>{error}</Text> : null}
        <Text style={styles.footer}>DuaVakti • Huzurla hatırla, vaktinde kıl.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07110d' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brand: { color: '#f5f7f5', fontSize: 31, fontWeight: '800' },
  location: { color: '#9eafa5', fontSize: 14, marginTop: 4 },
  moon: { color: '#b8ddc6', fontSize: 36 },
  nextCard: { backgroundColor: '#10261b', borderRadius: 24, padding: 24, alignItems: 'center', minHeight: 190, justifyContent: 'center', borderWidth: 1, borderColor: '#214531' },
  nextLabel: { color: '#8fb59d', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 7 },
  nextName: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
  nextTime: { color: '#bce2c9', fontSize: 47, fontWeight: '800', marginTop: 2 },
  countdown: { color: '#aabdb2', fontSize: 14, marginTop: 4 },
  error: { color: '#ffb4a8', textAlign: 'center' },
  sectionTitle: { color: '#f0f3f0', fontSize: 19, fontWeight: '700', marginTop: 25, marginBottom: 10 },
  list: { gap: 8 },
  row: { minHeight: 53, borderRadius: 15, backgroundColor: '#0d1b14', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: '#172a20' },
  nextRow: { borderColor: '#47755a', backgroundColor: '#142a1e' },
  icon: { fontSize: 19, width: 34 },
  prayerName: { flex: 1, color: '#dce6df', fontSize: 16, fontWeight: '600' },
  prayerTime: { color: '#b6c5bc', fontSize: 18, fontWeight: '700' },
  nextPrayerTime: { color: '#bce2c9' },
  refreshButton: { marginTop: 18, height: 50, borderRadius: 15, backgroundColor: '#a9d5b9', alignItems: 'center', justifyContent: 'center' },
  refreshText: { color: '#0a1710', fontSize: 16, fontWeight: '800' },
  smallError: { color: '#ffb4a8', textAlign: 'center', marginTop: 8, fontSize: 12 },
  footer: { color: '#617269', textAlign: 'center', marginTop: 'auto', marginBottom: 12, fontSize: 12 },
});
