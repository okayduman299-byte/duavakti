import type { NextPrayerResult, PrayerKey, PrayerTimes } from '../types';

export const PRAYER_ORDER: PrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  Fajr: 'Sabah',
  Dhuhr: 'Öğle',
  Asr: 'İkindi',
  Maghrib: 'Akşam',
  Isha: 'Yatsı',
};

export function cleanPrayerTime(value: unknown): string {
  if (typeof value !== 'string') return '--:--';
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return '--:--';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function normalizePrayerTimes(input: Record<string, unknown>): PrayerTimes {
  return {
    Fajr: cleanPrayerTime(input.Fajr),
    Dhuhr: cleanPrayerTime(input.Dhuhr),
    Asr: cleanPrayerTime(input.Asr),
    Maghrib: cleanPrayerTime(input.Maghrib),
    Isha: cleanPrayerTime(input.Isha),
  };
}

export function timeOnDate(base: Date, hhmm: string, addDays = 0): Date | null {
  const match = hhmm.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  const target = new Date(base);
  target.setDate(target.getDate() + addDays);
  target.setHours(hours, minutes, 0, 0);
  return target;
}

export function getNextPrayer(now: Date, timings: PrayerTimes): NextPrayerResult {
  for (const key of PRAYER_ORDER) {
    const target = timeOnDate(now, timings[key]);
    if (target && target.getTime() > now.getTime()) {
      return { key, label: PRAYER_LABELS[key], time: timings[key], target };
    }
  }

  const fajrTomorrow = timeOnDate(now, timings.Fajr, 1);
  const fallback = fajrTomorrow ?? new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return {
    key: 'Fajr',
    label: PRAYER_LABELS.Fajr,
    time: timings.Fajr,
    target: fallback,
  };
}

export function prayerRows(timings: PrayerTimes): Array<{ key: PrayerKey; label: string; time: string }> {
  return PRAYER_ORDER.map((key) => ({ key, label: PRAYER_LABELS[key], time: timings[key] }));
}

export function qiblaBearing(latitude: number, longitude: number): number {
  const kaabaLat = (21.4225 * Math.PI) / 180;
  const kaabaLon = (39.8262 * Math.PI) / 180;
  const lat = (latitude * Math.PI) / 180;
  const lon = (longitude * Math.PI) / 180;
  const deltaLon = kaabaLon - lon;

  const y = Math.sin(deltaLon);
  const x = Math.cos(lat) * Math.tan(kaabaLat) - Math.sin(lat) * Math.cos(deltaLon);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}
