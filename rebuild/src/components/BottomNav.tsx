import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TabKey } from '../types';
import { colors, radii } from '../theme';

const items: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'home', label: 'Ana', icon: '⌂' },
  { key: 'quran', label: 'Kur’an', icon: '۞' },
  { key: 'duas', label: 'Dualar', icon: '☾' },
  { key: 'widget', label: 'Widget', icon: '▣' },
  { key: 'settings', label: 'Ayarlar', icon: '⚙' },
];

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <View style={styles.bar}>
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <Pressable key={item.key} onPress={() => onChange(item.key)} style={[styles.item, selected && styles.selected]}>
            <Text style={[styles.icon, selected && styles.selectedText]}>{item.icon}</Text>
            <Text style={[styles.label, selected && styles.selectedText]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: '#101418', borderWidth: 1, borderColor: colors.border, borderRadius: 34, marginHorizontal: 18, marginBottom: 12, padding: 8, minHeight: 78 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radii.lg, gap: 4 },
  selected: { backgroundColor: colors.accentSoft },
  icon: { color: colors.textMuted, fontSize: 25 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  selectedText: { color: colors.text },
});
