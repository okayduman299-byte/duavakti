import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { AppPreferences, PrayerLocation } from '../types';
import { QiblaCompass } from '../components/QiblaCompass';
import { colors, radii } from '../theme';

export function SettingsScreen({
  preferences,
  updatePreferences,
  activeLocation,
  onRefresh,
}: {
  preferences: AppPreferences;
  updatePreferences: (patch: Partial<AppPreferences>) => void;
  activeLocation: PrayerLocation;
  onRefresh: () => void;
}) {
  const [city, setCity] = useState(preferences.city);

  const saveCity = () => {
    const clean = city.trim();
    if (!clean) return;
    updatePreferences({ city: clean, useGps: false });
    setTimeout(onRefresh, 0);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>AYARLAR</Text>
      <Text style={styles.title}>DuaVakti sana göre çalışsın.</Text>

      <QiblaCompass activeLocation={activeLocation} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Konum ve vakitler</Text>
        <Text style={styles.label}>Şehir</Text>
        <View style={styles.inputRow}>
          <TextInput value={city} onChangeText={setCity} style={styles.input} placeholder="Muradiye" placeholderTextColor={colors.textDim} />
          <Pressable style={styles.saveButton} onPress={saveCity}><Text style={styles.saveText}>Kaydet</Text></Pressable>
        </View>
        <Text style={styles.help}>Türkiye için Diyanet hesaplama yöntemiyle vakit servisi kullanılır. GPS seçildiyse koordinat bazlı sonuç alınır.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingText}><Text style={styles.cardTitle}>Arapça ayetleri göster</Text><Text style={styles.help}>Kur’an okuyucusunda Arapça metni açıp kapatır.</Text></View>
          <Switch value={preferences.arabicVisible} onValueChange={(value) => updatePreferences({ arabicVisible: value })} trackColor={{ true: colors.accentSoft }} thumbColor={colors.text} />
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <View style={styles.settingText}><Text style={styles.cardTitle}>GPS konumu</Text><Text style={styles.help}>Şehir yerine son alınan cihaz konumunu namaz vakitleri için kullanır.</Text></View>
          <Switch value={preferences.useGps} onValueChange={(value) => updatePreferences({ useGps: value })} trackColor={{ true: colors.accentSoft }} thumbColor={colors.text} />
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <View style={styles.settingText}><Text style={styles.cardTitle}>Ezan vakti uyarıları</Text><Text style={styles.help}>Namaz vakti girdiğinde bildirim gösterir. İlk kullanımda bildirim izni istenir ve önümüzdeki 7 gün planlanır.</Text></View>
          <Switch value={preferences.prayerNotifications} onValueChange={(value) => updatePreferences({ prayerNotifications: value })} trackColor={{ true: colors.accentSoft }} thumbColor={colors.text} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Uygulama hakkında</Text>
        <Text style={styles.help}>DuaVakti 1.5.0 · Ezan vakti uyarıları, saatlik dua widgetları ve kararlı Kur’an geçişi.</Text>
        <Text style={styles.help}>Kıble pusulası cihazın pusula yönünü canlı takip eder. Namaz vakitleri ve Kur’an verileri ağ hatalarında önbellekten çalışabilir.</Text>
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 28 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2.2, marginBottom: 12 },
  title: { color: colors.text, fontSize: 34, lineHeight: 42, fontWeight: '900', marginBottom: 24 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 18, marginBottom: 14 },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  label: { color: colors.textMuted, fontSize: 12, marginTop: 18, marginBottom: 8 },
  inputRow: { flexDirection: 'row' },
  input: { flex: 1, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 14, color: colors.text, paddingHorizontal: 14, paddingVertical: 12, marginRight: 8 },
  saveButton: { backgroundColor: colors.accentSoft, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15 },
  saveText: { color: colors.text, fontWeight: '800' },
  help: { color: colors.textMuted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingText: { flex: 1, paddingRight: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
});
