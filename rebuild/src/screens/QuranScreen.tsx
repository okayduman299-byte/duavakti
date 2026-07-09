import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import type { AppPreferences, AyahPair, SurahContent, SurahSummary } from '../types';
import { loadSurah, loadSurahList } from '../lib/quranService';
import { matchesSurah } from '../lib/quran';
import { getTurkishRevelationType } from '../data/surahNames';
import { readJson, writeJson } from '../lib/storage';
import { ErrorState, LoadingState } from '../components/States';
import { colors, radii } from '../theme';

const LAST_READ_KEY = 'duavakti:quran:last-read:v1';

export function QuranScreen({
  preferences,
  updatePreferences,
}: {
  preferences: AppPreferences;
  updatePreferences: (patch: Partial<AppPreferences>) => void;
}) {
  const [list, setList] = useState<SurahSummary[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SurahSummary | null>(null);
  const [content, setContent] = useState<SurahContent | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [readerLoading, setReaderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'network' | 'cache' | null>(null);
  const [lastRead, setLastRead] = useState<number | null>(null);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'doNotMix' });
    return () => {
      player.pause();
    };
  }, [player]);

  useEffect(() => {
    if (playerStatus.didJustFinish) setActiveAyah(null);
  }, [playerStatus.didJustFinish]);

  const fetchList = async () => {
    setListLoading(true);
    setError(null);
    try {
      const result = await loadSurahList();
      setList(result.data);
      setSource(result.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sure listesi alınamadı.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    void fetchList();
    readJson<{ surah: number }>(LAST_READ_KEY).then((value) => setLastRead(value?.surah ?? null));
  }, []);

  const openSurah = async (summary: SurahSummary) => {
    player.pause();
    setActiveAyah(null);
    setSelected(summary);
    setContent(null);
    setReaderLoading(true);
    setError(null);
    try {
      const result = await loadSurah(summary.number);
      setContent(result.data);
      setSource(result.source);
      setLastRead(summary.number);
      await writeJson(LAST_READ_KEY, { surah: summary.number, updatedAt: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sure açılamadı.');
    } finally {
      setReaderLoading(false);
    }
  };

  const toggleAyahAudio = (item: AyahPair) => {
    if (!item.audio || !selected) return;
    if (activeAyah === item.numberInSurah) {
      if (playerStatus.playing) player.pause();
      else player.play();
      return;
    }
    player.pause();
    player.replace(item.audio);
    setActiveAyah(item.numberInSurah);
    player.play();
  };

  const filtered = useMemo(() => list.filter((item) => matchesSurah(item, query)), [list, query]);

  if (selected) {
    return (
      <View style={styles.root}>
        <View style={styles.readerHeader}>
          <Pressable style={styles.backButton} onPress={() => { player.pause(); setActiveAyah(null); setSelected(null); setContent(null); setError(null); }}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.readerTitleWrap}>
            <Text style={styles.readerTitle}>{selected.number}. {selected.turkishName || `${selected.number}. Sure`}</Text>
            <Text style={styles.readerSubtitle}>{getTurkishRevelationType(selected.revelationType)} · {selected.numberOfAyahs} ayet</Text>
          </View>
          <View style={styles.fontControls}>
            <Pressable onPress={() => updatePreferences({ quranFontScale: Math.max(0.8, preferences.quranFontScale - 0.1) })} style={styles.fontButton}><Text style={styles.fontButtonText}>A−</Text></Pressable>
            <Pressable onPress={() => updatePreferences({ quranFontScale: Math.min(1.6, preferences.quranFontScale + 0.1) })} style={styles.fontButton}><Text style={styles.fontButtonText}>A+</Text></Pressable>
          </View>
        </View>
        {readerLoading ? <LoadingState label="Sure yükleniyor…" /> : null}
        {error && !content ? <View style={styles.pad}><ErrorState title="Sure açılamadı" detail={error} onRetry={() => void openSurah(selected)} /></View> : null}
        {content ? (
          <FlatList
            data={content.ayahs}
            keyExtractor={(item) => String(item.numberInSurah)}
            contentContainerStyle={styles.ayahList}
            initialNumToRender={10}
            windowSize={7}
            renderItem={({ item }) => {
              const isActive = activeAyah === item.numberInSurah;
              const isPlaying = isActive && playerStatus.playing;
              return (
                <View style={styles.ayahCard}>
                  <View style={styles.ayahTopRow}>
                    <View style={styles.ayahNumber}><Text style={styles.ayahNumberText}>{item.numberInSurah}</Text></View>
                    <Pressable
                      disabled={!item.audio}
                      onPress={() => toggleAyahAudio(item)}
                      style={[styles.audioButton, !item.audio && styles.audioButtonDisabled, isActive && styles.audioButtonActive]}
                    >
                      <Text style={styles.audioButtonText}>{playerStatus.isBuffering && isActive ? '…' : isPlaying ? 'Duraklat' : 'Dinle'}</Text>
                      <Text style={styles.audioIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
                    </Pressable>
                  </View>
                  {preferences.arabicVisible ? (
                    <Text style={[styles.arabic, { fontSize: 29 * preferences.quranFontScale, lineHeight: 54 * preferences.quranFontScale }]}>{item.arabic}</Text>
                  ) : null}
                  <View style={styles.ayahDivider} />
                  <Text style={[styles.translation, { fontSize: 16 * preferences.quranFontScale, lineHeight: 27 * preferences.quranFontScale }]}>{item.translation || 'Türkçe anlam yüklenemedi.'}</Text>
                </View>
              );
            }}
            ListHeaderComponent={source === 'cache' ? <Text style={styles.cacheNote}>Bu sure çevrimdışı önbellekten açıldı. Ses için internet gerekir.</Text> : null}
            ListFooterComponent={<View style={{ height: 120 }} />}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.headerContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>KUR’AN-I KERİM</Text>
        <Text style={styles.title}>Oku, dinle, kaldığın yerden devam et.</Text>
        {lastRead ? (
          <Pressable
            style={styles.continueCard}
            onPress={() => {
              const target = list.find((item) => item.number === lastRead);
              if (target) void openSurah(target);
            }}
          >
            <View>
              <Text style={styles.continueEyebrow}>SON OKUNAN</Text>
              <Text style={styles.continueTitle}>{list.find((item) => item.number === lastRead)?.turkishName || `${lastRead}. sure`}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        ) : null}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Sure ara…"
          placeholderTextColor={colors.textDim}
          style={styles.search}
          autoCorrect={false}
        />
      </ScrollView>

      {listLoading ? <LoadingState label="Sure listesi yükleniyor…" /> : null}
      {error && !list.length ? <View style={styles.pad}><ErrorState title="Kur’an bölümü yüklenemedi" detail={error} onRetry={() => void fetchList()} /></View> : null}
      {list.length ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.number)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.surahRow} onPress={() => void openSurah(item)}>
              <View style={styles.numberBadge}><Text style={styles.numberText}>{item.number}</Text></View>
              <View style={styles.surahInfo}>
                <Text style={styles.surahName}>{item.turkishName || `${item.number}. Sure`}</Text>
                <Text style={styles.surahMeta}>{getTurkishRevelationType(item.revelationType)} · {item.numberOfAyahs} ayet</Text>
              </View>
              <Text style={styles.surahArabic}>{item.name}</Text>
            </Pressable>
          )}
          ListHeaderComponent={source === 'cache' ? <Text style={styles.cacheNote}>Sure listesi çevrimdışı önbellekten gösteriliyor.</Text> : null}
          ListEmptyComponent={<Text style={styles.empty}>Aramana uygun sure bulunamadı.</Text>}
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerContent: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 10 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2.2, marginBottom: 12 },
  title: { color: colors.text, fontSize: 34, lineHeight: 42, fontWeight: '900', letterSpacing: -0.7 },
  continueCard: { marginTop: 22, backgroundColor: colors.greenCard, borderColor: colors.borderStrong, borderWidth: 1, borderRadius: radii.lg, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  continueEyebrow: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.8 },
  continueTitle: { color: colors.text, fontSize: 21, fontWeight: '800', marginTop: 5 },
  arrow: { color: colors.text, fontSize: 28 },
  search: { marginTop: 18, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, color: colors.text, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  surahRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md, padding: 14, marginBottom: 10 },
  numberBadge: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  numberText: { color: colors.accent, fontWeight: '900' },
  surahInfo: { flex: 1, marginLeft: 14 },
  surahName: { color: colors.text, fontSize: 17, fontWeight: '800' },
  surahMeta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  surahArabic: { color: colors.text, fontSize: 21, maxWidth: '35%', textAlign: 'right', writingDirection: 'rtl' },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  pad: { paddingHorizontal: 24 },
  cacheNote: { color: colors.warning, marginBottom: 10, fontSize: 12 },
  readerHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.text, fontSize: 38, lineHeight: 40, marginTop: -4 },
  readerTitleWrap: { flex: 1, marginLeft: 12 },
  readerTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  readerSubtitle: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  fontControls: { flexDirection: 'row', gap: 6 },
  fontButton: { backgroundColor: colors.surface, borderRadius: 11, paddingHorizontal: 9, paddingVertical: 8 },
  fontButtonText: { color: colors.text, fontWeight: '800', fontSize: 12 },
  ayahList: { padding: 16 },
  ayahCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 20, marginBottom: 14 },
  ayahTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  ayahNumber: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  ayahNumberText: { color: colors.accent, fontWeight: '900' },
  audioButton: { minWidth: 96, height: 38, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.accentSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  audioButtonActive: { borderWidth: 1, borderColor: colors.accent },
  audioButtonDisabled: { opacity: 0.35 },
  audioButtonText: { color: colors.text, fontSize: 12, fontWeight: '800' },
  audioIcon: { color: colors.accent, fontSize: 12, fontWeight: '900' },
  arabic: { color: colors.text, textAlign: 'right', writingDirection: 'rtl' },
  ayahDivider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
  translation: { color: colors.text, opacity: 0.92 },
});
