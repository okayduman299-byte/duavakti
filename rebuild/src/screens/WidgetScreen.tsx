import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NextPrayerResult, PrayerApiResult } from '../types';
import { DUAS } from '../data/duas';
import { getDailyDua } from '../lib/dua';
import { prayerRows } from '../lib/prayer';
import { updateNativeWidgets } from '../native/widget';
import { colors, radii } from '../theme';

export function WidgetScreen({ data, next, countdown }: { data: PrayerApiResult | null; next: NextPrayerResult | null; countdown: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const rows = useMemo(() => data ? prayerRows(data.timings) : [], [data]);
  const dailyDua = useMemo(() => getDailyDua(DUAS), []);

  const sync = async () => {
    if (!data || !next) {
      setStatus('Önce namaz vakitlerinin yüklenmesi gerekiyor.');
      return;
    }
    try {
      const updated = await updateNativeWidgets({
        location: data.locationLabel,
        nextPrayer: next.label,
        nextTime: next.time,
        remaining: countdown,
        targetEpoch: next.target.getTime(),
        prayers: rows.map((row) => ({ label: row.label, time: row.time })),
        duas: DUAS.map(({ title, meaning, source }) => ({ title, meaning, source })),
      });
      setStatus(updated ? 'Namaz vakti ve dua widgetları güncellendi.' : 'Expo Go içinde widget yok. APK/development build kurulduğunda çalışır.');
    } catch {
      setStatus('Widgetlar güncellenemedi. Uygulamayı yeniden açıp tekrar dene.');
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>ANA EKRAN WIDGETLARI</Text>
      <Text style={styles.title}>Vakti ve günün duasını uygulamayı açmadan gör.</Text>
      <Text style={styles.intro}>Dört seçenek hazırlandı. Android ana ekranında boş bir yere basılı tutup Widgetlar → DuaVakti yolunu kullan.</Text>

      <Text style={styles.section}>KÜÇÜK · SIRADAKİ VAKİT</Text>
      <View style={[styles.preview, styles.small]}>
        <Text style={styles.previewEyebrow}>SIRADAKİ</Text>
        <Text style={styles.previewTitle}>{next?.label ?? '—'}</Text>
        <Text style={styles.previewTime}>{next?.time ?? '--:--'}</Text>
      </View>

      <Text style={styles.section}>ORTA · GERİ SAYIM</Text>
      <View style={[styles.preview, styles.medium]}>
        <View><Text style={styles.previewEyebrow}>{data?.locationLabel ?? 'Konum'}</Text><Text style={styles.previewTitle}>{next?.label ?? '—'} {next?.time ?? '--:--'}</Text></View>
        <Text style={styles.countdown}>{countdown}</Text>
      </View>

      <Text style={styles.section}>BÜYÜK · BUGÜNÜN VAKİTLERİ</Text>
      <View style={[styles.preview, styles.large]}>
        <Text style={styles.previewEyebrow}>BUGÜNÜN VAKİTLERİ</Text>
        {rows.map((row) => <View key={row.key} style={styles.prayerRow}><Text style={styles.prayerLabel}>{row.label}</Text><Text style={styles.prayerTime}>{row.time}</Text></View>)}
      </View>

      <Text style={styles.section}>GÜNÜN DUASI</Text>
      <View style={[styles.preview, styles.duaPreview]}>
        <Text style={styles.previewEyebrow}>GÜNÜN DUASI</Text>
        <Text style={styles.duaTitle}>{dailyDua?.title ?? 'DuaVakti'}</Text>
        <Text numberOfLines={4} style={styles.duaMeaning}>{dailyDua?.meaning ?? 'Günün duası uygulama açıldığında hazırlanır.'}</Text>
        <Text style={styles.duaSource}>{dailyDua?.source ?? ''}</Text>
      </View>

      <Pressable style={styles.syncButton} onPress={() => void sync()}><Text style={styles.syncText}>Tüm widgetları şimdi güncelle</Text></Pressable>
      {status ? <Text style={styles.status}>{status}</Text> : null}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 28 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2.2, marginBottom: 12 },
  title: { color: colors.text, fontSize: 34, lineHeight: 42, fontWeight: '900' },
  intro: { color: colors.textMuted, fontSize: 15, lineHeight: 23, marginTop: 14, marginBottom: 28 },
  section: { color: colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 1.8, marginTop: 16, marginBottom: 10 },
  preview: { backgroundColor: colors.greenCard, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: radii.lg, padding: 18 },
  small: { width: 180, minHeight: 140 },
  medium: { minHeight: 126, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  large: { minHeight: 250 },
  duaPreview: { minHeight: 190 },
  previewEyebrow: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  previewTitle: { color: colors.text, fontSize: 25, fontWeight: '900', marginTop: 10 },
  previewTime: { color: colors.textMuted, fontSize: 22, marginTop: 4 },
  countdown: { color: colors.text, fontSize: 24, fontWeight: '900' },
  prayerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.borderStrong },
  prayerLabel: { color: colors.textMuted, fontSize: 15 },
  prayerTime: { color: colors.text, fontWeight: '900', fontSize: 16 },
  duaTitle: { color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: '900', marginTop: 12 },
  duaMeaning: { color: colors.text, fontSize: 15, lineHeight: 23, marginTop: 12 },
  duaSource: { color: colors.accent, fontSize: 11, fontWeight: '800', marginTop: 12 },
  syncButton: { backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.md, paddingVertical: 15, alignItems: 'center', marginTop: 28 },
  syncText: { color: colors.text, fontWeight: '900' },
  status: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 12 },
});
