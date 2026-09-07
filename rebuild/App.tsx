import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPrayerTimes } from './src/lib/prayerService';
import { getNextPrayer } from './src/lib/prayer';
import { formatCountdown } from './src/lib/time';
import { syncPrayerNotifications } from './src/lib/notificationService';
import { QuranScreenV2 as QuranScreen } from './src/screens/QuranScreenV2';
import { DuasScreen } from './src/screens/DuasScreen';
import { TesbihScreen } from './src/screens/TesbihScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import type { AppPreferences, PrayerApiResult, PrayerKey, PrayerLocation } from './src/types';
import { colors } from './src/theme';

const PRAYERS: Array<{ key: PrayerKey; label: string; icon: string }> = [
  { key: 'Fajr', label: 'İmsak', icon: '🌙' },
  { key: 'Dhuhr', label: 'Öğle', icon: '☀️' },
  { key: 'Asr', label: 'İkindi', icon: '🌤️' },
  { key: 'Maghrib', label: 'Akşam', icon: '🌅' },
  { key: 'Isha', label: 'Yatsı', icon: '🌌' },
];
const CITIES = ['Muradiye', 'Bursa', 'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Konya', 'Kocaeli', 'Sakarya', 'Balıkesir'];
const CITY_KEY = 'duavakti:selected-city:v1';
const PREFS_KEY = 'duavakti:preferences:v1';
const DEFAULT_PREFS: AppPreferences = { arabicVisible: true, quranFontScale: 1, city: 'Muradiye', country: 'Turkey', useGps: false, prayerNotifications: false };
type Tab = 'home' | 'quran' | 'duas' | 'tesbih' | 'settings';

function AppContent() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('home');
  const [city, setCity] = useState(DEFAULT_PREFS.city);
  const [data, setData] = useState<PrayerApiResult | null>(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFS);

  const refresh = async (selectedCity = city) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadPrayerTimes(new Date(), { mode: 'city', label: selectedCity, city: selectedCity, country: 'Turkey' });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Namaz vakitleri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      const savedCity = await AsyncStorage.getItem(CITY_KEY);
      const savedPrefs = await AsyncStorage.getItem(PREFS_KEY);
      const selected = savedCity && CITIES.includes(savedCity) ? savedCity : 'Muradiye';
      let parsed: Partial<AppPreferences> = {};
      try { parsed = savedPrefs ? JSON.parse(savedPrefs) as Partial<AppPreferences> : {}; } catch { parsed = {}; }
      const merged = { ...DEFAULT_PREFS, ...parsed, city: selected };
      setCity(selected);
      setPreferences(merged);
      await refresh(selected);
    })();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!data) return;
    const location: PrayerLocation = { mode: 'city', label: city, city, country: 'Turkey' };
    void syncPrayerNotifications({ enabled: preferences.prayerNotifications, location, todayData: data }).catch(() => undefined);
  }, [preferences.prayerNotifications, data, city]);

  const updatePreferences = (patch: Partial<AppPreferences>) => {
    setPreferences(current => {
      const next = { ...current, ...patch };
      void AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const selectCity = async (selected: string) => {
    setCity(selected);
    updatePreferences({ city: selected, useGps: false });
    await AsyncStorage.setItem(CITY_KEY, selected);
    await refresh(selected);
  };

  const next = useMemo(() => data ? getNextPrayer(now, data.timings) : null, [data, now]);
  const countdown = next ? formatCountdown(next.target.getTime() - now.getTime()) : '--:--:--';
  const activeLocation: PrayerLocation = { mode: 'city', label: city, city, country: 'Turkey' };

  const renderScreen = () => {
    if (tab === 'quran') return <QuranScreen preferences={preferences} updatePreferences={updatePreferences} />;
    if (tab === 'duas') return <DuasScreen />;
    if (tab === 'tesbih') return <TesbihScreen />;
    if (tab === 'settings') return <SettingsScreen preferences={preferences} updatePreferences={updatePreferences} activeLocation={activeLocation} onRefresh={() => void refresh(city)} />;
    return (
      <View style={styles.home}>
        <View style={styles.header}><View><Text style={styles.brand}>DuaVakti</Text><Text style={styles.location}>📍 {city} • Türkiye</Text></View></View>
        <View style={styles.nextCard}>
          <Text style={styles.nextLabel}>SIRADAKİ VAKİT</Text>
          {loading && !data ? <ActivityIndicator size="large" color={colors.accent} /> : next ? <><Text style={styles.nextName}>{next.label}</Text><Text style={styles.nextTime}>{next.time}</Text><Text style={styles.countdown}>Kalan süre  {countdown}</Text></> : <Text style={styles.error}>{error ?? 'Vakit bulunamadı.'}</Text>}
        </View>
        <Text style={styles.sectionTitle}>Bugünün Namaz Vakitleri</Text>
        <View style={styles.list}>{PRAYERS.map(prayer => { const isNext = next?.key === prayer.key; return <View key={prayer.key} style={[styles.row, isNext && styles.nextRow]}><Text style={styles.icon}>{prayer.icon}</Text><Text style={styles.prayerName}>{prayer.label}</Text><Text style={[styles.prayerTime, isNext && styles.nextPrayerTime]}>{data?.timings[prayer.key] ?? '--:--'}</Text></View>; })}</View>
        <Text style={styles.footer}>{error ? error : 'DuaVakti • Huzurla hatırla, vaktinde kıl.'}</Text>
      </View>
    );
  };

  return <SafeAreaView style={[styles.root, tab === 'home' ? styles.darkRoot : styles.lightRoot]}>
    <StatusBar barStyle={tab === 'home' ? 'light-content' : 'dark-content'} backgroundColor={tab === 'home' ? '#07110d' : colors.background} />
    <View style={styles.content}>{renderScreen()}</View>
    <BottomNav tab={tab} setTab={setTab} bottomInset={insets.bottom} />
  </SafeAreaView>;
}

function BottomNav({ tab, setTab, bottomInset }: { tab: Tab; setTab: (tab: Tab) => void; bottomInset: number }) {
  const items: Array<{ key: Tab; icon: string; label: string }> = [
    { key: 'home', icon: '🕌', label: 'Vakitler' },
    { key: 'quran', icon: '📖', label: 'Kuran' },
    { key: 'duas', icon: '🤲', label: 'Dualar' },
    { key: 'tesbih', icon: '📿', label: 'Tesbih' },
    { key: 'settings', icon: '⚙️', label: 'Ayarlar' },
  ];
  return <View style={[styles.nav, { paddingBottom: Math.max(7, bottomInset), height: 68 + bottomInset }]}>{items.map(item => <View key={item.key} style={styles.navItemWrap}><Text onPress={() => setTab(item.key)} style={[styles.navItem, tab === item.key && styles.navActive]}>{item.icon}{'\n'}<Text style={styles.navText}>{item.label}</Text></Text></View>)}</View>;
}

export default function App() { return <SafeAreaProvider><AppContent /></SafeAreaProvider>; }

const styles = StyleSheet.create({
  root:{flex:1}, darkRoot:{backgroundColor:'#07110d'}, lightRoot:{backgroundColor:colors.background}, content:{flex:1,paddingBottom:76}, home:{flex:1,paddingHorizontal:20,paddingTop:18}, header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},brand:{color:'#f5f7f5',fontSize:31,fontWeight:'800'},location:{color:'#9eafa5',fontSize:14,marginTop:4},nextCard:{backgroundColor:'#10261b',borderRadius:24,padding:24,alignItems:'center',minHeight:190,justifyContent:'center',borderWidth:1,borderColor:'#214531'},nextLabel:{color:'#8fb59d',fontSize:12,fontWeight:'800',letterSpacing:1.5,marginBottom:7},nextName:{color:'#fff',fontSize:24,fontWeight:'700'},nextTime:{color:'#bce2c9',fontSize:47,fontWeight:'800',marginTop:2},countdown:{color:'#aabdb2',fontSize:14,marginTop:4},error:{color:'#ffb4a8',textAlign:'center'},sectionTitle:{color:'#f0f3f0',fontSize:19,fontWeight:'700',marginTop:25,marginBottom:10},list:{gap:8},row:{minHeight:53,borderRadius:15,backgroundColor:'#0d1b14',flexDirection:'row',alignItems:'center',paddingHorizontal:15,borderWidth:1,borderColor:'#172a20'},nextRow:{borderColor:'#47755a',backgroundColor:'#142a1e'},icon:{fontSize:19,width:34},prayerName:{flex:1,color:'#dce6df',fontSize:16,fontWeight:'600'},prayerTime:{color:'#b6c5bc',fontSize:18,fontWeight:'700'},nextPrayerTime:{color:'#bce2c9'},footer:{color:'#617269',textAlign:'center',marginTop:'auto',fontSize:12},nav:{position:'absolute',left:0,right:0,bottom:0,backgroundColor:'#0b1711',borderTopWidth:1,borderTopColor:'#1c3024',flexDirection:'row',justifyContent:'space-around',alignItems:'center'},navItemWrap:{flex:1,alignItems:'center'},navItem:{textAlign:'center',fontSize:19,lineHeight:22,color:'#aebcb3',paddingHorizontal:6,paddingVertical:4,borderRadius:12},navActive:{backgroundColor:'#14271d'},navText:{fontSize:10,fontWeight:'700',color:'#aebcb3'}});
