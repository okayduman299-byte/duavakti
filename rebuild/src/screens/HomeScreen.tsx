import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PrayerApiResult, NextPrayerResult } from '../types';
import { DAILY_CARDS } from '../data/cards';
import { dayIndex, formatTurkishDate } from '../lib/time';
import { PrayerCard } from '../components/PrayerCard';
import { ErrorState, LoadingState } from '../components/States';
import { colors, radii, spacing } from '../theme';

export function HomeScreen({
  data,
  loading,
  error,
  next,
  countdown,
  onRefresh,
  onLocate,
}: {
  data: PrayerApiResult | null;
  loading: boolean;
  error: string | null;
  next: NextPrayerResult | null;
  countdown: string;
  onRefresh: () => void;
  onLocate: () => void;
}) {
  const now = new Date();
  const card = useMemo(() => DAILY_CARDS[dayIndex(now, DAILY_CARDS.length)], [now.getDate()]);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>DuaVakti</Text>
          <Text style={styles.subtitle}>{formatTurkishDate(now)} · {data?.locationLabel ?? 'Muradiye'}</Text>
        </View>
        <Pressable style={styles.locationButton} onPress={onLocate} accessibilityLabel="Konumumu kullan">
          <Text style={styles.locationIcon}>⌖</Text>
        </Pressable>
      </View>

      {loading && !data ? <LoadingState label="Namaz vakitleri yükleniyor…" /> : null}
      {error && !data ? <ErrorState title="Vakitler alınamadı" detail={error} onRetry={onRefresh} /> : null}
      {data && next ? <PrayerCard next={next} countdown={countdown} timings={data.timings} /> : null}
      {data?.source === 'cache' ? <Text style={styles.cacheNote}>Çevrimdışı kayıtlı vakitler gösteriliyor.</Text> : null}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>GÜNÜN KARTI</Text>
          <Text style={styles.sectionTitle}>Bir an dur, hatırla.</Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={onRefresh}><Text style={styles.refreshText}>↻</Text></Pressable>
      </View>

      <View style={styles.dailyCard}>
        <View style={styles.meaningCol}>
          <Text style={styles.cardTag}>{card.tag}</Text>
          <Text style={styles.cardMeaning}>{card.meaning}</Text>
          <Text style={styles.reference}>{card.reference}</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.arabicCol}>
          <Text style={styles.arabic}>{card.arabic}</Text>
        </View>
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 28, paddingTop: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appName: { color: colors.text, fontSize: 38, fontWeight: '900', letterSpacing: -1.2 },
  subtitle: { color: colors.textMuted, fontSize: 16, marginTop: 8 },
  locationButton: { width: 64, height: 64, borderRadius: 25, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  locationIcon: { color: colors.text, fontSize: 28 },
  cacheNote: { color: colors.warning, fontSize: 12, marginTop: 9, marginLeft: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 42, marginBottom: 20 },
  eyebrow: { color: colors.textMuted, fontWeight: '900', letterSpacing: 2.2, fontSize: 12, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 31, fontWeight: '900', letterSpacing: -0.8 },
  refreshButton: { width: 58, height: 58, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  refreshText: { color: colors.text, fontSize: 28 },
  dailyCard: { minHeight: 390, backgroundColor: colors.greenDeep, borderRadius: radii.xl, borderWidth: 1, borderColor: '#1D6A4C', flexDirection: 'row', padding: spacing.xl },
  meaningCol: { flex: 1, paddingRight: 22 },
  cardTag: { color: colors.accent, fontWeight: '900', letterSpacing: 2, fontSize: 12, marginBottom: 22 },
  cardMeaning: { color: colors.text, fontSize: 27, lineHeight: 42, fontWeight: '700' },
  reference: { color: colors.textMuted, marginTop: 24, fontSize: 13 },
  verticalDivider: { width: 1, backgroundColor: '#4B7E68', marginVertical: 2 },
  arabicCol: { flex: 1.15, justifyContent: 'center', paddingLeft: 24 },
  arabic: { color: colors.text, fontSize: 30, lineHeight: 56, textAlign: 'right', writingDirection: 'rtl' },
});
