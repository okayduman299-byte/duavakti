import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NextPrayerResult, PrayerTimes } from '../types';
import { prayerRows } from '../lib/prayer';
import { colors, radii, spacing } from '../theme';

export function PrayerCard({ next, countdown, timings }: { next: NextPrayerResult; countdown: string; timings: PrayerTimes }) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>SIRADAKİ VAKİT</Text>
      <View style={styles.headRow}>
        <View>
          <Text style={styles.nextLabel}>{next.label}</Text>
          <Text style={styles.nextTime}>{next.time}</Text>
        </View>
        <View style={styles.countWrap}>
          <Text style={styles.countLabel}>KALAN</Text>
          <Text style={styles.countdown}>{countdown}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.prayers}>
        {prayerRows(timings).map((row) => (
          <View key={row.key} style={styles.prayerItem}>
            <Text style={styles.prayerLabel}>{row.label}</Text>
            <Text style={styles.prayerTime}>{row.time}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.greenCard, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: radii.xl, padding: spacing.lg, marginTop: 20 },
  eyebrow: { color: colors.accent, fontWeight: '900', letterSpacing: 2.4, fontSize: 13 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28 },
  nextLabel: { color: colors.text, fontSize: 49, lineHeight: 55, fontWeight: '800' },
  nextTime: { color: colors.textMuted, fontSize: 27, marginTop: 4 },
  countWrap: { alignItems: 'flex-end', paddingBottom: 3 },
  countLabel: { color: colors.textMuted, fontSize: 12, letterSpacing: 2, fontWeight: '800', marginBottom: 10 },
  countdown: { color: colors.text, fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'] },
  divider: { height: 1, backgroundColor: colors.borderStrong, marginVertical: 24 },
  prayers: { flexDirection: 'row', justifyContent: 'space-between' },
  prayerItem: { alignItems: 'center', flex: 1 },
  prayerLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 7 },
  prayerTime: { color: colors.text, fontWeight: '800', fontSize: 16 },
});
