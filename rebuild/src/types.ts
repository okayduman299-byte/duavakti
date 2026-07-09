export type TabKey = 'home' | 'quran' | 'duas' | 'widget' | 'settings';

export type PrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerLocation {
  mode: 'city' | 'gps';
  label: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface PrayerApiResult {
  dateKey: string;
  locationKey: string;
  locationLabel: string;
  timings: PrayerTimes;
  hijriDate?: string;
  source: 'network' | 'cache';
}

export interface NextPrayerResult {
  key: PrayerKey;
  label: string;
  time: string;
  target: Date;
}

export interface SurahSummary {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface AyahPair {
  numberInSurah: number;
  arabic: string;
  translation: string;
}

export interface SurahContent {
  summary: SurahSummary;
  ayahs: AyahPair[];
}

export interface AppPreferences {
  arabicVisible: boolean;
  quranFontScale: number;
  city: string;
  country: string;
  useGps: boolean;
}

export interface DailyCard {
  tag: string;
  title: string;
  meaning: string;
  arabic: string;
  reference: string;
}

export interface DuaItem {
  id: string;
  title: string;
  category: string;
  arabic: string;
  latin: string;
  meaning: string;
  source: string;
}
