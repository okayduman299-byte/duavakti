import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DUAS } from '../data/duas';
import type { DuaItem } from '../types';
import { colors, radii } from '../theme';

export function DuasScreen() {
  const [selected, setSelected] = useState<DuaItem | null>(null);
  const categories = useMemo(() => Array.from(new Set(DUAS.map((item) => item.category))), []);

  if (selected) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.detailContent}>
        <Pressable style={styles.back} onPress={() => setSelected(null)}><Text style={styles.backText}>‹ Dualar</Text></Pressable>
        <Text style={styles.category}>{selected.category}</Text>
        <Text style={styles.detailTitle}>{selected.title}</Text>
        <View style={styles.detailCard}>
          <Text style={styles.arabic}>{selected.arabic}</Text>
          <View style={styles.divider} />
          <Text style={styles.latin}>{selected.latin}</Text>
          <Text style={styles.meaning}>{selected.meaning}</Text>
          <Text style={styles.source}>{selected.source}</Text>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>DUALAR</Text>
        <Text style={styles.title}>İhtiyacın olan sözü yanında taşı.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map((category) => <View key={category} style={styles.chip}><Text style={styles.chipText}>{category}</Text></View>)}
        </ScrollView>
      </View>
      <FlatList
        data={DUAS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => setSelected(item)}>
            <View style={styles.moon}><Text style={styles.moonText}>☾</Text></View>
            <View style={styles.rowText}>
              <Text style={styles.rowCategory}>{item.category}</Text>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text numberOfLines={2} style={styles.rowMeaning}>{item.meaning}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        )}
        ListFooterComponent={<View style={{ height: 120 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 28, paddingTop: 24 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2.2, marginBottom: 12 },
  title: { color: colors.text, fontSize: 34, lineHeight: 42, fontWeight: '900' },
  chips: { gap: 8, paddingVertical: 18 },
  chip: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 99, paddingHorizontal: 13, paddingVertical: 8 },
  chipText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  list: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 16, marginBottom: 12 },
  moon: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  moonText: { color: colors.accent, fontSize: 24 },
  rowText: { flex: 1, marginLeft: 14 },
  rowCategory: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  rowTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 4 },
  rowMeaning: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 5 },
  arrow: { color: colors.textMuted, fontSize: 22 },
  detailContent: { padding: 24 },
  back: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9, marginBottom: 28 },
  backText: { color: colors.text, fontWeight: '800' },
  category: { color: colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  detailTitle: { color: colors.text, fontSize: 34, lineHeight: 42, fontWeight: '900', marginTop: 10, marginBottom: 24 },
  detailCard: { backgroundColor: colors.greenCard, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.xl, padding: 24 },
  arabic: { color: colors.text, fontSize: 31, lineHeight: 57, textAlign: 'right', writingDirection: 'rtl' },
  divider: { height: 1, backgroundColor: colors.borderStrong, marginVertical: 22 },
  latin: { color: colors.text, fontSize: 17, lineHeight: 29, fontStyle: 'italic' },
  meaning: { color: colors.textMuted, fontSize: 16, lineHeight: 26, marginTop: 18 },
  source: { color: colors.accent, fontSize: 12, fontWeight: '800', marginTop: 20 },
});
