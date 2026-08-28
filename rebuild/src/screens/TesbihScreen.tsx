import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { readJson, writeJson } from '../lib/storage';
import { colors, radii, spacing } from '../theme';

type Dhikr = {
  id: string;
  title: string;
  arabic: string;
  meaning: string;
  target: number;
};

const DHIKRS: Dhikr[] = [
  { id: 'subhanallah', title: 'Sübhanallah', arabic: 'سُبْحَانَ اللَّهِ', meaning: 'Allah her türlü eksiklikten uzaktır.', target: 33 },
  { id: 'elhamdulillah', title: 'Elhamdülillah', arabic: 'الْحَمْدُ لِلَّهِ', meaning: 'Hamd Allah’a mahsustur.', target: 33 },
  { id: 'allahu-ekber', title: 'Allahu Ekber', arabic: 'اللَّهُ أَكْبَرُ', meaning: 'Allah en büyüktür.', target: 33 },
  { id: 'la-ilahe-illallah', title: 'Lâ ilâhe illallah', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', meaning: 'Allah’tan başka ilah yoktur.', target: 100 },
  { id: 'salavat', title: 'Salavat', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', meaning: 'Allah’ım, Muhammed’e salât eyle.', target: 100 },
];

const STORAGE_KEY = 'duavakti:tesbih:v1';

type SavedState = { selectedId: string; count: number };

export function TesbihScreen() {
  const [selectedId, setSelectedId] = useState(DHIKRS[0].id);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  const selected = DHIKRS.find((item) => item.id === selectedId) ?? DHIKRS[0];

  useEffect(() => {
    readJson<SavedState>(STORAGE_KEY).then((saved) => {
      if (saved && DHIKRS.some((item) => item.id === saved.selectedId)) {
        setSelectedId(saved.selectedId);
        setCount(Math.max(0, Number(saved.count) || 0));
      }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    void writeJson<SavedState>(STORAGE_KEY, { selectedId, count });
  }, [ready, selectedId, count]);

  const increment = () => {
    setCount((value) => value + 1);
  };

  const reset = () => setCount(0);

  const selectDhikr = (id: string) => {
    setSelectedId(id);
    setCount(0);
  };

  const progress = Math.min(count / selected.target, 1);
  const completed = count > 0 && count % selected.target === 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>TESBİH</Text>
      <Text style={styles.title}>Kalbini zikre ver.</Text>
      <Text style={styles.subtitle}>Zikrini seç, sayacı dokunarak ilerlet.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choices}>
        {DHIKRS.map((item) => {
          const active = item.id === selected.id;
          return (
            <Pressable key={item.id} onPress={() => selectDhikr(item.id)} style={[styles.choice, active && styles.choiceActive]}>
              <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{item.title}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{selected.title.toUpperCase()}</Text>
        <Text style={styles.arabic}>{selected.arabic}</Text>
        <Text style={styles.meaning}>{selected.meaning}</Text>

        <Pressable
          onPress={increment}
          accessibilityRole="button"
          accessibilityLabel={`${selected.title} sayacını artır`}
          style={({ pressed }) => [styles.counterButton, pressed && styles.counterButtonPressed]}
        >
          <Text style={styles.count}>{count}</Text>
          <Text style={styles.target}>Hedef {selected.target}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progress, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.tap}>DOKUN</Text>
        </Pressable>

        {completed ? <Text style={styles.completed}>✓ Hedef tamamlandı. Devam edebilirsin.</Text> : null}

        <Pressable onPress={reset} style={styles.resetButton}>
          <Text style={styles.resetText}>Sayacı sıfırla</Text>
        </Pressable>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>Zikrin kaldığı yer kaydedilir.</Text>
        <Text style={styles.infoText}>Uygulamayı kapatsan bile seçtiğin zikir ve sayaç cihazında saklanır.</Text>
      </View>
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 28 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2.2, marginBottom: 12 },
  title: { color: colors.text, fontSize: 34, lineHeight: 42, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  choices: { paddingVertical: 20, paddingRight: 28 },
  choice: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 },
  choiceActive: { backgroundColor: colors.accentSoft, borderColor: colors.borderStrong },
  choiceText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  choiceTextActive: { color: colors.text },
  card: { backgroundColor: colors.greenCard, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.xl, padding: 22, alignItems: 'center' },
  cardLabel: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 18 },
  arabic: { color: colors.text, fontSize: 30, lineHeight: 52, textAlign: 'center', writingDirection: 'rtl' },
  meaning: { color: colors.textMuted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 10 },
  counterButton: { width: 245, height: 245, borderRadius: 123, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginTop: 26 },
  counterButtonPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  count: { color: colors.text, fontSize: 64, lineHeight: 72, fontWeight: '900', fontVariant: ['tabular-nums'] },
  target: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginTop: 2 },
  progressTrack: { width: 130, height: 4, backgroundColor: colors.border, borderRadius: 99, marginTop: 14, overflow: 'hidden' },
  progress: { height: 4, backgroundColor: colors.accent, borderRadius: 99 },
  tap: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 15 },
  completed: { color: colors.accent, fontSize: 12, fontWeight: '800', marginTop: 18, textAlign: 'center' },
  resetButton: { marginTop: 18, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  resetText: { color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  info: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 18, marginTop: 14 },
  infoTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  infoText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  bottomSpace: { height: 120 },
});
