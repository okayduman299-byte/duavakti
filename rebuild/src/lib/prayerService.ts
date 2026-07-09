import type { PrayerApiResult, PrayerLocation } from '../types';
import { fetchJson } from './api';
import { normalizePrayerTimes } from './prayer';
import { readJson, writeJson } from './storage';
import { toApiDate, toDateKey } from './time';

const CACHE_PREFIX = 'duavakti:prayer:';

function locationKey(location: PrayerLocation): string {
  if (location.mode === 'gps' && location.latitude != null && location.longitude != null) {
    return `gps:${location.latitude.toFixed(3)},${location.longitude.toFixed(3)}`;
  }
  return `city:${location.city ?? 'Muradiye'}:${location.country ?? 'Turkey'}`;
}

function buildUrl(date: Date, location: PrayerLocation): string {
  const datePart = toApiDate(date);
  if (location.mode === 'gps' && location.latitude != null && location.longitude != null) {
    return `https://api.aladhan.com/v1/timings/${datePart}?latitude=${encodeURIComponent(String(location.latitude))}&longitude=${encodeURIComponent(String(location.longitude))}&method=13`;
  }
  const city = encodeURIComponent(location.city ?? 'Muradiye');
  const country = encodeURIComponent(location.country ?? 'Turkey');
  return `https://api.aladhan.com/v1/timingsByCity/${datePart}?city=${city}&country=${country}&method=13`;
}

export async function loadPrayerTimes(date: Date, location: PrayerLocation): Promise<PrayerApiResult> {
  const dateKey = toDateKey(date);
  const locKey = locationKey(location);
  const cacheKey = `${CACHE_PREFIX}${dateKey}:${locKey}`;

  try {
    const payload = await fetchJson(buildUrl(date, location));
    const data = (payload as any)?.data;
    const timings = normalizePrayerTimes(data?.timings ?? {});
    if (Object.values(timings).some((value) => value === '--:--')) {
      throw new Error('Eksik vakit verisi');
    }
    const result: PrayerApiResult = {
      dateKey,
      locationKey: locKey,
      locationLabel: location.label,
      timings,
      hijriDate: typeof data?.date?.hijri?.date === 'string' ? data.date.hijri.date : undefined,
      source: 'network',
    };
    await writeJson(cacheKey, result);
    return result;
  } catch (error) {
    const cached = await readJson<PrayerApiResult>(cacheKey);
    if (cached) return { ...cached, source: 'cache' };
    throw error;
  }
}
