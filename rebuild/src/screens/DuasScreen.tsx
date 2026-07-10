import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DUAS } from '../data/duas';
import { colors, radii } from '../theme';
import type { DuaItem } from '../types';

const ALL_CATEGORY = 'Tümü';
const CATEGORIES = [ALL_CATEGORY, ...Array.from(new Set(DUAS.map((item) => item.category)))];

function safeText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeDua(item: unknown): DuaItem | null {
  if (!item || typeof item !== 'object') return null;
  const row = item as Record<string, unknown>;
  const id = safeText(row.id);
  const title = safeText(row.title);
  if (!id || !title) return null;
  return {
    id,
    title,
    category: safeText(row.category, 'Dua'),
    arabic: safeText(row.arabic),
    latin: safeText(row.latin),
    meaning: safeText(row.meaning),
    source: safeText(row.source),
  };
}

const SAFE_DUAS = DUAS.flatMap((item) => {
  const normalized = normalizeDua(item);
  return normalized ? [normalized] : [];
});

function DuaDetail({ item, onBack }: { item: DuaItem; onBack: () => void }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.detailContent} keyboardShouldPersistTaps="handled">
      <Pressable style={styles.back} onPress={onBack}>
        <Text style={styles.backText}>‹ Dualar</Text>
      </Pressable>
      <Text style={styles.category}>{safeText(item.category, 'Dua')}</Text>
      <Text style={styles.detailTitle}>{safeText(item.title, 'Dua')}</Text>
      <View style={styles.detailCard}>
        {item.arabic ? <Text style={styles.arabic}>{safeText(item.arabic)}</Text> : null}
        <View style={styles.divider} />
        {item.latin ? <Text style={styles.latin}>{safeText(item.latin)}</Text> : null}
        {item.meaning ? <Text style={styles.meaning}>{safeText(item.meaning)}</Text> : null}
        {item.source ? <Text style={styles.source}>{safeText(item.source)}</Text> : null}
      </View>
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

export function DuasScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState(ALL_CATEGORY);

  const selected = selectedId ? SAFE_DUAS.find((item) => item.id === selectedId) ?? null : null;
  const visible = useMemo(
    () => (category === ALL_CATEGORY ? SAFE_DUAS : SAFE_DUAS.filter((item) => item.category === category)),
    [category],
  );

  if (selected) {
    return <DuaDetail item={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>DUALAR</Text>
        <Text style={styles.title}>İhtiyacın olan sözü yanında taşı.</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((item) => {
            const active = category === item;
            return (
              <Pressable
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{safeText(item)}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.list}>
        {visible.map((item) => (
          <Pressable key={item.id} style={styles.row} onPress={() => setSelectedId(item.id)}>
            <View style={styles.moon}><Text style={styles.moonText}>☾</Text></View>
            <View style={styles.rowText}>
              <Text style={styles.rowCategory}>{safeText(item.category)}</Text>
              <Text style={styles.rowTitle}>{safeText(item.title)}</Text>
              <Text numberOfLines={2} style={styles.rowMeaning}>{safeText(item.meaning)}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1 },
  header: { paddingHorizontal: 28, paddingTop: 24 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2.2, marginBottom: 12 },
  title: { color: colors.text, fontSize: 34, lineHeight: 42, fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 18, marginBottom: 10 },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 99, paddingHorizontal: 13, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.borderStrong },
  chipText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: colors.text },
  list: { paddingHorizontal: 20, paddingTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 16, marginBottom: 12 },
  moon: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  moonText: { color: colors.accent, fontSize: 24 },
  rowText: { flex: 1, marginLeft: 14, paddingRight: 8 },
  rowCategory: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  rowTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 4 },
  rowMeaning: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 5 },
  arrow: { color: colors.textMuted, fontSize: 28, lineHeight: 30 },
  detailContent: { padding: 24 },
  back: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9, marginBottom: 28 },
  backText: { color: colors.text, fontWeight: '800' },
  category: { color: colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  detailTitle: { color: colors.text, fontSize: 34, lineHeight: 42, fontWeight: '900', marginTop: 10, marginBottom: 24 },
  detailCard: { backgroundColor: colors.greenCard, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.xl, padding: 24 },
  arabic: { color: colors.text, fontSize: 31, lineHeight: 57, textAlign: 'right', writingDirection: 'rtl' },
  divider: { height: 1, backgroundColor: colors.borderStrong, marginVertical: 22 },
  latin: { color: colors.text, fontSize: 17, lineHeight: 29 },
  meaning: { color: colors.textMuted, fontSize: 16, lineHeight: 27, marginTop: 18 },
  source: { color: colors.accent, fontSize: 12, fontWeight: '800', marginTop: 20 },
  bottomSpace: { height: 120 },
});
