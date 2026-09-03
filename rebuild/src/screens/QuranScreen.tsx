import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import type {
  AppPreferences,
  AyahPair,
  SurahContent,
  SurahSummary,
} from "../types";
import { loadSurah, loadSurahList } from "../lib/quranService";
import { matchesSurah, normalizeSurahSummary } from "../lib/quran";
import { getTurkishRevelationType } from "../data/surahNames";
import { readJson, writeJson } from "../lib/storage";
import { ErrorState, LoadingState } from "../components/States";
import { colors, radii } from "../theme";

const LAST_READ_KEY = "duavakti:quran:last-read:v1";

export function QuranScreen({
  preferences,
  updatePreferences,
}: {
  preferences: AppPreferences;
  updatePreferences: (patch: Partial<AppPreferences>) => void;
}) {
  const [list, setList] = useState<SurahSummary[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SurahSummary | null>(null);
  const [content, setContent] = useState<SurahContent | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [readerLoading, setReaderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [source, setSource] = useState<"network" | "cache" | null>(null);
  const [lastRead, setLastRead] = useState<number | null>(null);
  const ayahListRef = useRef<FlatList<AyahPair>>(null);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  // Tek bir AudioPlayer kullanıyoruz. Önceki AudioPlaylist yaklaşımı bazı Android
  // cihazlarında sure detayına girerken JS tarafında bölüm hatasına yol açıyordu.
  // Bu yapı daha basit: ayet bitince bir sonraki kaynağa geçiyoruz.
  const player = useAudioPlayer(null, { updateInterval: 400 });
  const playerStatus = useAudioPlayerStatus(player);
  const playableAyahs = useMemo(
    () => (Array.isArray(content?.ayahs) ? content.ayahs.filter((item) => Boolean(item?.audio)) : []),
    [content],
  );
  const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);
  const autoContinueRef = useRef(false);
  const lastDidFinishRef = useRef(false);
  const activeAyah =
    activeAudioIndex !== null
      ? (playableAyahs[activeAudioIndex]?.numberInSurah ?? null)
      : null;

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
    }).catch(() => undefined);
    // useAudioPlayer kendi yaşam döngüsünü yönetir ve ekran kapanınca otomatik
    // serbest bırakılır. Unmount sırasında elle pause etmek bazı Android
    // cihazlarında Kur’an -> Dualar geçişinde native yarış durumuna yol açıyordu.
  }, []);

  useEffect(() => {
    const wasFinished = lastDidFinishRef.current;
    lastDidFinishRef.current = playerStatus.didJustFinish;
    if (!playerStatus.didJustFinish || wasFinished || activeAudioIndex === null) return;

    const nextIndex = activeAudioIndex + 1;
    const next = playableAyahs[nextIndex];
    if (autoContinueRef.current && next?.audio) {
      setActiveAudioIndex(nextIndex);
      player.replace(next.audio);
      player.play();
      setAudioError(null);
      return;
    }

    autoContinueRef.current = false;
  }, [
    activeAudioIndex,
    playableAyahs,
    player,
    playerStatus.didJustFinish,
  ]);

  useEffect(() => {
    if (activeAudioIndex === null) return;
    const active = playableAyahs[activeAudioIndex];
    if (!active) return;
    const indexInSurah =
      content?.ayahs.findIndex(
        (item) => item.numberInSurah === active.numberInSurah,
      ) ?? -1;
    if (indexInSurah < 0) return;
    const timer = setTimeout(() => {
      ayahListRef.current?.scrollToIndex({
        index: indexInSurah,
        animated: true,
        viewPosition: 0.18,
      });
    }, 120);
    return () => clearTimeout(timer);
  }, [activeAudioIndex, content?.ayahs, playableAyahs]);

  const fetchList = async () => {
    setListLoading(true);
    setError(null);
    try {
      const result = await loadSurahList();
      if (!mountedRef.current) return;
      setList(result.data);
      setSource(result.source);
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : "Sure listesi alınamadı.");
    } finally {
      if (mountedRef.current) setListLoading(false);
    }
  };

  useEffect(() => {
    void fetchList();
    readJson<{ surah: number }>(LAST_READ_KEY).then((value) => {
      if (mountedRef.current) setLastRead(value?.surah ?? null);
    });
  }, []);

  const stopAudio = () => {
    try {
      player.pause();
    } catch {
      // Ses modülü hatası ekranı kapatmamalı.
    }
    autoContinueRef.current = false;
    lastDidFinishRef.current = false;
    setActiveAudioIndex(null);
  };

  const openSurah = async (summary: SurahSummary) => {
    const safeSummary = normalizeSurahSummary(summary);
    if (!safeSummary) {
      setError("Sure bilgisi geçersiz. Listeyi yeniden yükleyin.");
      return;
    }
    stopAudio();
    setSelected(safeSummary);
    setContent(null);
    setReaderLoading(true);
    setError(null);
    try {
      const result = await loadSurah(safeSummary.number);
      if (!mountedRef.current) return;
      setContent(result.data);
      setSource(result.source);
      setLastRead(safeSummary.number);
      await writeJson(LAST_READ_KEY, {
        surah: safeSummary.number,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : "Sure açılamadı.");
    } finally {
      if (mountedRef.current) setReaderLoading(false);
    }
  };

  const startAudioAt = (index: number) => {
    const item = playableAyahs[index];
    if (!item?.audio) return;
    lastDidFinishRef.current = playerStatus.didJustFinish;
    autoContinueRef.current = true;
    setActiveAudioIndex(index);
    player.replace(item.audio);
    player.play();
    setAudioError(null);
  };

  const toggleAyahAudio = (item: AyahPair) => {
    try {
      if (!item.audio) return;
      const audioIndex = playableAyahs.findIndex(
        (ayah) => ayah.numberInSurah === item.numberInSurah,
      );
      if (audioIndex < 0) return;

      if (activeAudioIndex === audioIndex) {
        if (playerStatus.playing) {
          player.pause();
        } else {
          autoContinueRef.current = true;
          player.play();
        }
        return;
      }

      startAudioAt(audioIndex);
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : "Ses başlatılamadı.");
    }
  };

  const toggleWholeSurah = () => {
    try {
      if (!playableAyahs.length) return;
      if (playerStatus.playing) {
        player.pause();
        return;
      }

      const atEnd =
        activeAudioIndex === playableAyahs.length - 1 &&
        playerStatus.duration > 0 &&
        playerStatus.currentTime >= playerStatus.duration - 0.5;
      if (activeAudioIndex === null || playerStatus.didJustFinish || atEnd) {
        startAudioAt(0);
        return;
      }

      autoContinueRef.current = true;
      player.play();
      setAudioError(null);
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : "Ses başlatılamadı.");
    }
  };

  const filtered = useMemo(
    () => list.filter((item) => matchesSurah(item, query)),
    [list, query],
  );

  if (selected) {
    const selectedNumber = Number.isFinite(selected.number) ? selected.number : 0;
    const selectedName = selected.turkishName || (selectedNumber ? `${selectedNumber}. Sure` : "Sure");
    const selectedAyahCount = Number.isFinite(selected.numberOfAyahs) ? selected.numberOfAyahs : 0;
    const finished =
      playerStatus.didJustFinish ||
      (playableAyahs.length > 0 &&
        (activeAudioIndex ?? 0) === playableAyahs.length - 1 &&
        playerStatus.duration > 0 &&
        playerStatus.currentTime >= playerStatus.duration - 0.5);
    const wholeButtonLabel = playerStatus.playing
      ? "Duraklat"
      : finished
        ? "Baştan dinle"
        : (activeAudioIndex ?? 0) > 0 || playerStatus.currentTime > 0
          ? "Devam et"
          : "Tümünü dinle";
    const currentAudioProgress =
      playerStatus.duration > 0
        ? Math.min(1, Math.max(0, playerStatus.currentTime / playerStatus.duration))
        : 0;
    const surahProgress = playableAyahs.length
      ? Math.min(1, Math.max(0, ((activeAudioIndex ?? 0) + currentAudioProgress) / playableAyahs.length))
      : 0;

    return (
      <View style={styles.root}>
        <View style={styles.readerHeader}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              stopAudio();
              setSelected(null);
              setContent(null);
              setError(null);
            }}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.readerTitleWrap}>
            <Text style={styles.readerTitle}>
              {selectedNumber}.{" "}
              {selectedName}
            </Text>
            <Text style={styles.readerSubtitle}>
              {getTurkishRevelationType(selected.revelationType)} ·{" "}
              {selectedAyahCount} ayet
            </Text>
          </View>
          <View style={styles.fontControls}>
            <Pressable
              onPress={() =>
                updatePreferences({
                  quranFontScale: Math.max(
                    0.8,
                    preferences.quranFontScale - 0.1,
                  ),
                })
              }
              style={styles.fontButton}
            >
              <Text style={styles.fontButtonText}>A−</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                updatePreferences({
                  quranFontScale: Math.min(
                    1.6,
                    preferences.quranFontScale + 0.1,
                  ),
                })
              }
              style={styles.fontButton}
            >
              <Text style={styles.fontButtonText}>A+</Text>
            </Pressable>
          </View>
        </View>

        {content && playableAyahs.length ? (
          <View style={styles.surahAudioBar}>
            <View style={styles.surahAudioTextWrap}>
              <Text style={styles.surahAudioEyebrow}>KESİNTİSİZ DİNLEME</Text>
              <Text style={styles.surahAudioText}>
                {activeAyah
                  ? `${activeAyah}. ayet · ${(activeAudioIndex ?? 0) + 1}/${playableAyahs.length}`
                  : `${playableAyahs.length} ayet hazır`}
              </Text>
            </View>
            <Pressable
              style={[
                styles.wholeAudioButton,
                playerStatus.playing && styles.audioButtonActive,
              ]}
              onPress={toggleWholeSurah}
            >
              <Text style={styles.wholeAudioButtonText}>
                {wholeButtonLabel}
              </Text>
              <Text style={styles.audioIcon}>
                {playerStatus.playing ? "❚❚" : "▶"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {content && playableAyahs.length ? (
          <View pointerEvents="none" style={styles.progressDock}>
            <View style={{ marginBottom: 4, alignItems: "center" }}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: colors.textMuted }}>
                {activeAyah ? `Okunan: ${activeAyah}. ayet` : "Ayet takibi hazır"}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              {playableAyahs.map((ayah, index) => {
                const isPast = activeAudioIndex !== null && index < activeAudioIndex;
                const isCurrent = activeAudioIndex === index;
                const fillWidth: `${number}%` = isPast
                  ? "100%"
                  : isCurrent
                    ? `${currentAudioProgress * 100}%` as `${number}%`
                    : "0%";
                return (
                  <View key={`progress-${ayah.numberInSurah}`} style={{ flex: 1, height: 4, paddingRight: index === playableAyahs.length - 1 ? 0 : 1 }}>
                    <View
                      style={{
                        height: 4,
                        width: fillWidth,
                        borderRadius: 2,
                        backgroundColor: colors.accent,
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {audioError ? (
          <View style={styles.audioErrorBox}>
            <Text style={styles.audioErrorText}>Ses özelliği geçici olarak kullanılamıyor. Metin okumaya devam edebilirsin.</Text>
          </View>
        ) : null}
        {readerLoading ? <LoadingState label="Sure yükleniyor…" /> : null}
        {error && !content ? (
          <View style={styles.pad}>
            <ErrorState
              title="Sure açılamadı"
              detail={error}
              onRetry={() => void openSurah(selected)}
            />
          </View>
        ) : null}
        {content ? (
          <FlatList
            ref={ayahListRef}
            data={content.ayahs}
            keyExtractor={(item) => String(item.numberInSurah)}
            contentContainerStyle={styles.ayahList}
            initialNumToRender={10}
            windowSize={7}
            onScrollToIndexFailed={({ index }) => {
              setTimeout(
                () =>
                  ayahListRef.current?.scrollToOffset({
                    offset: Math.max(index * 260, 0),
                    animated: true,
                  }),
                120,
              );
            }}
            renderItem={({ item }) => {
              const playlistIndex = playableAyahs.findIndex(
                (ayah) => ayah.numberInSurah === item.numberInSurah,
              );
              const isActive =
                playlistIndex >= 0 &&
                activeAudioIndex !== null &&
                activeAudioIndex === playlistIndex;
              const isPlaying = isActive && playerStatus.playing;
              return (
                <View
                  style={[styles.ayahCard, isActive && styles.ayahCardActive]}
                >
                  <View style={styles.ayahTopRow}>
                    <View style={styles.ayahNumber}>
                      <Text style={styles.ayahNumberText}>
                        {item.numberInSurah}
                      </Text>
                    </View>
                    <Pressable
                      disabled={!item.audio}
                      onPress={() => toggleAyahAudio(item)}
                      style={[
                        styles.audioButton,
                        !item.audio && styles.audioButtonDisabled,
                        isActive && styles.audioButtonActive,
                      ]}
                    >
                      <Text style={styles.audioButtonText}>
                        {playerStatus.isBuffering && isActive
                          ? "…"
                          : isPlaying
                            ? "Duraklat"
                            : isActive
                              ? "Devam et"
                              : "Buradan dinle"}
                      </Text>
                      <Text style={styles.audioIcon}>
                        {isPlaying ? "❚❚" : "▶"}
                      </Text>
                    </Pressable>
                  </View>
                  {preferences.arabicVisible ? (
                    <Text
                      style={[
                        styles.arabic,
                        {
                          fontSize: 29 * preferences.quranFontScale,
                          lineHeight: 54 * preferences.quranFontScale,
                        },
                      ]}
                    >
                      {item.arabic}
                    </Text>
                  ) : null}
                  <View style={styles.ayahDivider} />
                  <Text
                    style={[
                      styles.translation,
                      {
                        fontSize: 16 * preferences.quranFontScale,
                        lineHeight: 27 * preferences.quranFontScale,
                      },
                    ]}
                  >
                    {item.translation || "Türkçe anlam yüklenemedi."}
                  </Text>
                </View>
              );
            }}
            ListHeaderComponent={
              source === "cache" ? (
                <Text style={styles.cacheNote}>
                  Bu sure çevrimdışı önbellekten açıldı. Ses için internet
                  gerekir.
                </Text>
              ) : null
            }
            ListFooterComponent={<View style={{ height: 120 }} />}
          />
        ) : null}
        {content && playableAyahs.length ? (
          <View pointerEvents="none" style={styles.progressDock}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${surahProgress * 100}%` }]} />
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.headerContent}
        keyboardShouldPersistTaps="handled"
      >
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
              <Text style={styles.continueTitle}>
                {list.find((item) => item.number === lastRead)?.turkishName ||
                  `${lastRead}. sure`}
              </Text>
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
      {error && !list.length ? (
        <View style={styles.pad}>
          <ErrorState
            title="Kur’an bölümü yüklenemedi"
            detail={error}
            onRetry={() => void fetchList()}
          />
        </View>
      ) : null}
      {list.length ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.number)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.surahRow}
              onPress={() => void openSurah(item)}
            >
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{item.number}</Text>
              </View>
              <View style={styles.surahInfo}>
                <Text style={styles.surahName}>
                  {item.turkishName || `${item.number}. Sure`}
                </Text>
                <Text style={styles.surahMeta}>
                  {getTurkishRevelationType(item.revelationType)} ·{" "}
                  {item.numberOfAyahs} ayet
                </Text>
              </View>
              <Text style={styles.surahArabic}>{item.name}</Text>
            </Pressable>
          )}
          ListHeaderComponent={
            source === "cache" ? (
              <Text style={styles.cacheNote}>
                Sure listesi çevrimdışı önbellekten gösteriliyor.
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.empty}>Aramana uygun sure bulunamadı.</Text>
          }
          ListFooterComponent={<View style={{ height: 120 }} />}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerContent: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 10 },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.2,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  continueCard: {
    marginTop: 22,
    backgroundColor: colors.greenCard,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  continueEyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  continueTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
    marginTop: 5,
  },
  arrow: { color: colors.text, fontSize: 28 },
  search: {
    marginTop: 18,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  surahRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 10,
  },
  numberBadge: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: { color: colors.accent, fontWeight: "900" },
  surahInfo: { flex: 1, marginLeft: 14 },
  surahName: { color: colors.text, fontSize: 17, fontWeight: "800" },
  surahMeta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  surahArabic: {
    color: colors.text,
    fontSize: 21,
    maxWidth: "35%",
    textAlign: "right",
    writingDirection: "rtl",
  },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 40 },
  pad: { paddingHorizontal: 24 },
  cacheNote: { color: colors.warning, marginBottom: 10, fontSize: 12 },
  surahAudioBar: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  surahAudioTextWrap: { flex: 1 },
  surahAudioEyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  surahAudioText: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  progressDock: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 70,
    height: 8,
    justifyContent: "center",
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  wholeAudioButton: {
    minWidth: 112,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: colors.greenCard,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  wholeAudioButtonText: { color: colors.text, fontSize: 12, fontWeight: "900" },
  readerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: colors.text, fontSize: 38, lineHeight: 40, marginTop: -4 },
  readerTitleWrap: { flex: 1, marginLeft: 12 },
  readerTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  readerSubtitle: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  fontControls: { flexDirection: "row", gap: 6 },
  fontButton: {
    backgroundColor: colors.surface,
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  fontButtonText: { color: colors.text, fontWeight: "800", fontSize: 12 },
  ayahList: { padding: 16 },
  ayahCardActive: { borderColor: colors.accent },
  ayahCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 20,
    marginBottom: 14,
  },
  ayahTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ayahNumber: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  ayahNumberText: { color: colors.accent, fontWeight: "900" },
  audioButton: {
    minWidth: 96,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  audioButtonActive: { borderWidth: 1, borderColor: colors.accent },
  audioButtonDisabled: { opacity: 0.35 },
  audioButtonText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  audioIcon: { color: colors.accent, fontSize: 12, fontWeight: "900" },
  arabic: { color: colors.text, textAlign: "right", writingDirection: "rtl" },
  ayahDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },
  translation: { color: colors.text, opacity: 0.92 },
  audioErrorBox: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  audioErrorText: { color: colors.warning, fontSize: 12, lineHeight: 18 },
});
