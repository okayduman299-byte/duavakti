import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import type { AppPreferences, PrayerApiResult, PrayerLocation } from '../types';
import { loadPrayerTimes } from '../lib/prayerService';
import { getNextPrayer } from '../lib/prayer';
import { formatCountdown } from '../lib/time';

export function usePrayerData(preferences: AppPreferences, onGpsEnabled: (enabled: boolean) => void) {
  const [data, setData] = useState<PrayerApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [gpsLocation, setGpsLocation] = useState<PrayerLocation | null>(null);

  const cityLocation = useMemo<PrayerLocation>(() => ({
    mode: 'city',
    label: preferences.city || 'Muradiye',
    city: preferences.city || 'Muradiye',
    country: preferences.country || 'Turkey',
  }), [preferences.city, preferences.country]);

  const activeLocation = preferences.useGps && gpsLocation ? gpsLocation : cityLocation;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadPrayerTimes(new Date(), activeLocation);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vakitler alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [activeLocation]);

  const useCurrentLocation = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Konum izni verilmedi. Şehir ayarıyla devam ediliyor.');
        onGpsEnabled(false);
        return false;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const label = 'Konumum';
      const next: PrayerLocation = {
        mode: 'gps',
        label,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setGpsLocation(next);
      onGpsEnabled(true);
      return true;
    } catch {
      setError('Konum alınamadı. Şehir ayarıyla devam ediliyor.');
      onGpsEnabled(false);
      return false;
    }
  }, [onGpsEnabled]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const next = useMemo(() => (data ? getNextPrayer(now, data.timings) : null), [data, now]);
  const countdown = next ? formatCountdown(next.target.getTime() - now.getTime()) : '--:--:--';

  return { data, error, loading, refresh, useCurrentLocation, next, countdown, activeLocation };
}
