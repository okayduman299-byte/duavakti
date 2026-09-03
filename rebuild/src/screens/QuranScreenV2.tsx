import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Speech from 'expo-speech';
import type { AppPreferences, AyahPair, SurahContent, SurahSummary } from '../types';
import { loadReciters, loadSurah, loadSurahList, type QuranReciter } from '../lib/quranService';
import { matchesSurah, normalizeSurahSummary } from '../lib/quran';
import { getTurkishRevelationType } from '../data/surahNames';
import { readJson, writeJson } from '../lib/storage';
import { ErrorState, LoadingState } from '../components/States';

const LAST_READ_KEY = 'duavakti:quran:last-read:v2';
const RECITER_KEY = 'duavakti:quran:reciter:v1';
const DEFAULT_RECITER = 'ar.alafasy';

export function QuranScreenV2({ preferences, updatePreferences }: { preferences: AppPreferences; updatePreferences: (patch: Partial<AppPreferences>) => void }) {
  const [list, setList] = useState<SurahSummary[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SurahSummary | null>(null);
  const [content, setContent] = useState<SurahContent | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [readerLoading, setReaderLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRead, setLastRead] = useState<number | null>(null);
  const [lastReadAyah, setLastReadAyah] = useState(0);
  const [reciters, setReciters] = useState<QuranReciter[]>([]);
  const [reciter, setReciter] = useState(DEFAULT_RECITER);
  const [reciterOpen, setReciterOpen] = useState(false);
  const [mealPlaying, setMealPlaying] = useState(false);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const player = useAudioPlayer(null, { updateInterval: 400 });
  const status = useAudioPlayerStatus(player);
  const listRef = useRef<FlatList<AyahPair>>(null);
  const autoContinue = useRef(false);
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; Speech.stop().catch(() => undefined); }, []);
  useEffect(() => { void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'doNotMix' }).catch(() => undefined); }, []);

  const playable = useMemo(() => content?.ayahs.filter((a) => Boolean(a.audio)) ?? [], [content]);
  const filtered = useMemo(() => list.filter((s) => matchesSurah(s, query)), [list, query]);

  useEffect(() => {
    void loadSurahList().then((r) => { if (mounted.current) setList(r.data); }).catch((e) => { if (mounted.current) setError(e instanceof Error ? e.message : 'Sureler alınamadı.'); }).finally(() => { if (mounted.current) setListLoading(false); });
    void readJson<{ surah: number; ayah?: number }>(LAST_READ_KEY).then((v) => { if (mounted.current) { setLastRead(v?.surah ?? null); setLastReadAyah(v?.ayah ?? 0); } });
    void readJson<string>(RECITER_KEY).then((v) => { if (v && mounted.current) setReciter(v); });
    void loadReciters().then((r) => { if (mounted.current) setReciters(r); }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!status.didJustFinish || activeAudioIndex === null) return;
    const next = playable[activeAudioIndex + 1];
    if (autoContinue.current && next?.audio) { setActiveAudioIndex(activeAudioIndex + 1); player.replace(next.audio); player.play(); }
    else autoContinue.current = false;
  }, [activeAudioIndex, playable, player, status.didJustFinish]);

  const stopAudio = () => { try { player.pause(); } catch {} autoContinue.current = false; setActiveAudioIndex(null); };

  const openSurah = async (summary: SurahSummary, resumeAyah = 0) => {
    const safe = normalizeSurahSummary(summary); if (!safe) return setError('Sure bilgisi geçersiz.');
    stopAudio(); setSelected(safe); setContent(null); setReaderLoading(true); setError(null);
    try {
      const selectedReciter = (await readJson<string>(RECITER_KEY)) || reciter;
      const r = await loadSurah(safe.number, selectedReciter); if (!mounted.current) return;
      setContent(r.data); setLastRead(safe.number); setLastReadAyah(resumeAyah);
      await writeJson(LAST_READ_KEY, { surah: safe.number, ayah: resumeAyah, updatedAt: new Date().toISOString() });
    } catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : 'Sure açılamadı.'); }
    finally { if (mounted.current) setReaderLoading(false); }
  };

  const chooseReciter = async (item: QuranReciter) => { setReciter(item.identifier); setReciterOpen(false); await writeJson(RECITER_KEY, item.identifier); if (selected) await openSurah(selected, lastReadAyah); };
  const playAt = (index: number) => { const a = playable[index]; if (!a?.audio) return; setActiveAudioIndex(index); autoContinue.current = true; player.replace(a.audio); player.play(); setAudioError(null); };
  const toggleAyah = (item: AyahPair) => { try { const i = playable.findIndex((a) => a.numberInSurah === item.numberInSurah); if (i < 0) return; if (activeAudioIndex === i) { if (status.playing) player.pause(); else { autoContinue.current = true; player.play(); } } else playAt(i); } catch (e) { setAudioError(e instanceof Error ? e.message : 'Ses başlatılamadı.'); } };

  const speakMeal = async () => {
    if (!content) return;
    try {
      if (mealPlaying) { await Speech.stop(); setMealPlaying(false); return; }
      stopAudio(); setMealPlaying(true);
      const text = content.ayahs.map((a) => `${a.numberInSurah}. ${a.translation}`).join(' ');
      Speech.speak(text.slice(0, Speech.maxSpeechInputLength), { language: 'tr-TR', rate: 0.9, onDone: () => setMealPlaying(false), onStopped: () => setMealPlaying(false), onError: () => setMealPlaying(false) });
    } catch { setMealPlaying(false); }
  };

  const markRead = async (ayah: number) => { if (!selected) return; setLastRead(selected.number); setLastReadAyah(ayah); await writeJson(LAST_READ_KEY, { surah: selected.number, ayah, updatedAt: new Date().toISOString() }); };

  if (selected) return (
    <View style={styles.readerRoot}>
      <View style={styles.readerHeader}><Pressable style={styles.back} onPress={() => { stopAudio(); setSelected(null); setContent(null); }}><Text style={styles.backText}>‹</Text></Pressable><View style={styles.readerTitleWrap}><Text style={styles.readerTitle}>{selected.number}. {selected.turkishName}</Text><Text style={styles.readerSub}>{getTurkishRevelationType(selected.revelationType)} · {selected.numberOfAyahs} ayet</Text></View><Pressable style={styles.fontButton} onPress={() => updatePreferences({ quranFontScale: Math.min(1.6, preferences.quranFontScale + 0.1) })}><Text style={styles.fontText}>A+</Text></Pressable></View>
      <View style={styles.tools}><Pressable style={styles.tool} onPress={() => setReciterOpen(true)}><Text style={styles.toolIcon}>🎙</Text><Text style={styles.toolText}>Hafız</Text></Pressable><Pressable style={[styles.tool, mealPlaying && styles.toolActive]} onPress={() => void speakMeal()}><Text style={styles.toolIcon}>🔊</Text><Text style={styles.toolText}>{mealPlaying ? 'Meali durdur' : 'Meali seslendir'}</Text></Pressable><Pressable style={styles.tool} onPress={() => updatePreferences({ arabicVisible: !preferences.arabicVisible })}><Text style={styles.toolIcon}>ع</Text><Text style={styles.toolText}>Arapça</Text></Pressable></View>
      {readerLoading ? <LoadingState label="Sure yükleniyor…" /> : null}
      {error && !content ? <ErrorState title="Sure açılamadı" detail={error} onRetry={() => void openSurah(selected, lastReadAyah)} /> : null}
      {content ? <FlatList ref={listRef} data={content.ayahs} keyExtractor={(a) => String(a.numberInSurah)} contentContainerStyle={styles.ayahList} initialScrollIndex={lastReadAyah > 0 ? Math.min(lastReadAyah - 1, content.ayahs.length - 1) : undefined} onScrollToIndexFailed={() => undefined} renderItem={({ item }) => { const i = playable.findIndex((a) => a.numberInSurah === item.numberInSurah); const active = i >= 0 && i === activeAudioIndex; return <Pressable onPress={() => void markRead(item.numberInSurah)} style={[styles.ayah, active && styles.ayahActive]}><View style={styles.ayahTop}><View style={styles.num}><Text style={styles.numText}>{item.numberInSurah}</Text></View><Pressable disabled={!item.audio} onPress={() => toggleAyah(item)} style={styles.play}><Text style={styles.playText}>{active && status.playing ? '❚❚' : '▶'}</Text></Pressable></View>{preferences.arabicVisible ? <Text style={[styles.arabic, { fontSize: 28 * preferences.quranFontScale, lineHeight: 52 * preferences.quranFontScale }]}>{item.arabic}</Text> : null}<View style={styles.divider}/><Text style={[styles.translation, { fontSize: 16 * preferences.quranFontScale, lineHeight: 27 * preferences.quranFontScale }]}>{item.translation}</Text></Pressable>; }} /> : null}
      {audioError ? <Text style={styles.audioError}>{audioError}</Text> : null}
      <ReciterModal visible={reciterOpen} reciters={reciters} selected={reciter} onClose={() => setReciterOpen(false)} onSelect={(r) => void chooseReciter(r)} />
    </View>
  );

  const last = lastRead ? list.find((s) => s.number === lastRead) : null;
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.home} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Kuran-ı Kerim</Text>
        <Text style={styles.intro}>Oku, dinle ve anlamını keşfet.</Text>
        <View style={styles.features}><Pressable style={styles.feature} onPress={() => setReciterOpen(true)}><Text style={styles.featureIcon}>🎙</Text><Text style={styles.featureTitle}>18 Farklı Hafız</Text><Text style={styles.featureSub}>Tilavet seç</Text></Pressable><Pressable style={styles.feature} onPress={() => last && void openSurah(last, lastReadAyah)}><Text style={styles.featureIcon}>📖</Text><Text style={styles.featureTitle}>Okuma Takibi</Text><Text style={styles.featureSub}>{last ? `${last.turkishName} · ${lastReadAyah || 1}. ayet` : 'Henüz başlanmadı'}</Text></Pressable><Pressable style={styles.featureWide} onPress={() => last && void openSurah(last, lastReadAyah)}><Text style={styles.featureIcon}>🔊</Text><View style={{flex:1}}><Text style={styles.featureTitle}>Meal Seslendirme</Text><Text style={styles.featureSub}>Türkçe meali cihazın sesinden dinle</Text></View><Text style={styles.arrow}>›</Text></Pressable></View>
        <Text style={styles.section}>Sureler</Text>
        <View style={styles.search}><Text style={styles.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Sure ara" placeholderTextColor="#8a96a0" style={styles.input}/></View>
        {listLoading ? <LoadingState label="Sureler hazırlanıyor…"/> : error && !list.length ? <ErrorState title="Kuran yüklenemedi" detail={error} onRetry={() => undefined}/> : filtered.map((s) => <Pressable key={s.number} style={styles.surah} onPress={() => void openSurah(s)}><View style={styles.surahNum}><Text style={styles.surahNumText}>{s.number}</Text></View><View style={{flex:1}}><Text style={styles.surahName}>{s.turkishName}</Text><Text style={styles.meta}>{getTurkishRevelationType(s.revelationType)} · {s.numberOfAyahs} ayet</Text></View><Text style={styles.surahArabic}>{s.name}</Text><Text style={styles.arrow}>›</Text></Pressable>)}
      </ScrollView>
      <ReciterModal visible={reciterOpen} reciters={reciters} selected={reciter} onClose={() => setReciterOpen(false)} onSelect={(r) => void chooseReciter(r)} />
    </View>
  );
}

function ReciterModal({ visible, reciters, selected, onClose, onSelect }: { visible: boolean; reciters: QuranReciter[]; selected: string; onClose: () => void; onSelect: (r: QuranReciter) => void }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.backdrop}><View style={styles.modal}><View style={styles.modalHead}><Text style={styles.modalTitle}>18 Farklı Hafız</Text><Pressable onPress={onClose}><Text style={styles.close}>✕</Text></Pressable></View><Text style={styles.modalSub}>Kur’an tilaveti için okuyucu seç</Text><ScrollView>{reciters.map((r, i) => <Pressable key={r.identifier} style={[styles.reciter, r.identifier === selected && styles.reciterSelected]} onPress={() => onSelect(r)}><View style={styles.badge}><Text style={styles.badgeText}>{i + 1}</Text></View><Text style={styles.reciterName}>{r.name}</Text>{r.identifier === selected ? <Text style={styles.check}>✓</Text> : null}</Pressable>)}</ScrollView></View></View></Modal>;
}

const styles = StyleSheet.create({
  root:{flex:1,backgroundColor:'#f7f8fa'},home:{padding:20,paddingBottom:110},title:{textAlign:'center',fontSize:30,fontWeight:'800',color:'#243b83',marginTop:8},intro:{textAlign:'center',color:'#657080',fontSize:16,marginTop:6,marginBottom:18},features:{flexDirection:'row',flexWrap:'wrap',gap:10},feature:{width:'48%',minHeight:126,backgroundColor:'#fff',borderRadius:20,padding:16,borderWidth:1,borderColor:'#e2e6eb'},featureWide:{width:'100%',minHeight:92,backgroundColor:'#fff',borderRadius:20,padding:16,borderWidth:1,borderColor:'#e2e6eb',flexDirection:'row',alignItems:'center',gap:12},featureIcon:{fontSize:27,marginBottom:8},featureTitle:{color:'#1f2937',fontSize:17,fontWeight:'800'},featureSub:{color:'#7b8794',fontSize:12,marginTop:5},arrow:{fontSize:30,color:'#a0a8b1'},section:{fontSize:23,fontWeight:'800',color:'#202833',marginTop:26,marginBottom:10},search:{height:48,backgroundColor:'#fff',borderRadius:14,borderWidth:1,borderColor:'#e1e5ea',flexDirection:'row',alignItems:'center',paddingHorizontal:14,marginBottom:12},searchIcon:{fontSize:22,color:'#6b7480'},input:{flex:1,color:'#222831',fontSize:15,marginLeft:8},surah:{backgroundColor:'#fff',minHeight:72,borderRadius:17,marginBottom:8,padding:12,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'#e7eaee'},surahNum:{width:42,height:42,borderRadius:13,backgroundColor:'#eef2ff',alignItems:'center',justifyContent:'center',marginRight:12},surahNumText:{color:'#31488e',fontWeight:'800'},surahName:{color:'#202833',fontSize:16,fontWeight:'800'},meta:{color:'#87919d',fontSize:11,marginTop:3},surahArabic:{color:'#31488e',fontSize:17,maxWidth:95,textAlign:'right'},readerRoot:{flex:1,backgroundColor:'#fff'},readerHeader:{height:70,paddingHorizontal:12,flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderBottomColor:'#e7e9ed'},back:{width:42,height:42,alignItems:'center',justifyContent:'center'},backText:{fontSize:39,color:'#243b83',lineHeight:40},readerTitleWrap:{flex:1},readerTitle:{color:'#243b83',fontSize:20,fontWeight:'800'},readerSub:{color:'#87919d',fontSize:11,marginTop:3},fontButton:{width:42,height:38,borderRadius:12,backgroundColor:'#eef2ff',alignItems:'center',justifyContent:'center'},fontText:{color:'#243b83',fontWeight:'800'},tools:{padding:10,flexDirection:'row',gap:8,borderBottomWidth:1,borderBottomColor:'#eef0f2'},tool:{flex:1,minHeight:48,borderRadius:14,backgroundColor:'#f2f4f7',alignItems:'center',justifyContent:'center'},toolActive:{backgroundColor:'#dfe8ff'},toolIcon:{fontSize:17},toolText:{fontSize:10,color:'#3d4650',fontWeight:'700',marginTop:2},ayahList:{padding:12,paddingBottom:110},ayah:{backgroundColor:'#fff',borderRadius:18,padding:16,marginBottom:10,borderWidth:1,borderColor:'#e5e8ec'},ayahActive:{borderColor:'#8aa0e8',backgroundColor:'#f7f9ff'},ayahTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},num:{width:32,height:32,borderRadius:16,backgroundColor:'#eef2ff',alignItems:'center',justifyContent:'center'},numText:{color:'#31488e',fontWeight:'800'},play:{width:38,height:34,borderRadius:11,backgroundColor:'#243b83',alignItems:'center',justifyContent:'center'},playText:{color:'#fff',fontSize:14},arabic:{color:'#111827',textAlign:'right',marginTop:16},divider:{height:1,backgroundColor:'#eceff2',marginVertical:12},translation:{color:'#4d5965'},audioError:{position:'absolute',bottom:72,left:12,right:12,padding:10,borderRadius:12,backgroundColor:'#fff1f0',color:'#a63d36',fontSize:12},backdrop:{flex:1,backgroundColor:'rgba(0,0,0,.55)',justifyContent:'flex-end'},modal:{maxHeight:'82%',backgroundColor:'#fff',borderTopLeftRadius:28,borderTopRightRadius:28,padding:20},modalHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},modalTitle:{fontSize:24,fontWeight:'800',color:'#243b83'},close:{fontSize:22,color:'#69727d'},modalSub:{fontSize:13,color:'#7c8792',marginTop:5,marginBottom:14},reciter:{minHeight:55,borderRadius:13,marginBottom:7,paddingHorizontal:10,flexDirection:'row',alignItems:'center',backgroundColor:'#f7f8fa'},reciterSelected:{backgroundColor:'#eef2ff'},badge:{width:32,height:32,borderRadius:10,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',marginRight:10},badgeText:{color:'#31488e',fontWeight:'800'},reciterName:{flex:1,color:'#27313b',fontSize:13,fontWeight:'700'},check:{color:'#31488e',fontSize:20,fontWeight:'900'}
});
