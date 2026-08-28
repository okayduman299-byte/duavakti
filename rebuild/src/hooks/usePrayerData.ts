import { AppState } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';
import type { AppPreferences, PrayerApiResult, PrayerLocation } from '../types';
import { loadPrayerTimes } from '../lib/prayerService';
import { getNextPrayer } from '../lib/prayer';
import { formatCountdown } from '../lib/time';
import { readJson } from '../lib/storage';
import { BACKGROUND_LOCATION_TASK, startAutomaticLocationTracking } from '../native/locationTask';

const LAST_LOCATION_KEY = 'duavakti:last-background-location:v1';

export function usePrayerData(preferences: AppPreferences, onGpsEnabled: (enabled: boolean) => void) {
  const [data, setData] = useState<PrayerApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [gpsLocation, setGpsLocation] = useState<PrayerLocation | null>(null);
  const lastLoadedLocation = useRef<PrayerLocation | null>(null);

  const cityLocation = useMemo<PrayerLocation>(() => ({
    mode: 'city',
    label: preferences.city || 'Muradiye',
    city: preferences.city || 'Muradiye',
    country: preferences.country || 'Turkey',
  }), [preferences.city, preferences.country]);

  const activeLocation = preferences.useGps && gpsLocation ? gpsLocation : cityLocation;

  const refresh = useCallback(async (locationOverride?: PrayerLocation) => {
    setLoading(true);
    setError(null);
    try {
      const location = locationOverride ?? activeLocation;
      const result = await loadPrayerTimes(new Date(), location);
      setData(result);
      lastLoadedLocation.current = location;
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
      const next: PrayerLocation = {
        mode: 'gps',
        label: 'Konumum',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setGpsLocation(next);
      onGpsEnabled(true);

      // Ask once for background permission so the app can follow city-to-city
      // travel even when it is minimized or the screen is locked.
      const background = await Location.requestBackgroundPermissionsAsync();
      if (background.status === 'granted') {
        await startAutomaticLocationTracking();
      }
      return true;
    } catch {
      setError('Konum alınamadı. Şehir ayarıyla devam ediliyor.');
      onGpsEnabled(false);
      return false;
    }
  }, [onGpsEnabled]);

  useEffect(() => {
    if (!preferences.useGps) return;
    void useCurrentLocation();
  }, [preferences.useGps, useCurrentLocation]);

  // Restore the last location received by the background task immediately.
  // This avoids waiting for a fresh GPS fix after a long trip.
  useEffect(() => {
    if (!preferences.useGps) return;
    void readJson<PrayerLocation>(LAST_LOCATION_KEY).then((stored) => {
      if (!stored || stored.latitude == null || stored.longitude == null) return;
      setGpsLocation(stored);
      void refresh(stored);
    });
  }, [preferences.useGps, refresh]);

  useEffect(() => {
    if (!preferences.useGps) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void useCurrentLocation();
    });
    return () => subscription.remove();
  }, [preferences.useGps, useCurrentLocation]);

  useEffect(() => {
    if (!preferences.useGps) return;

    let watcher: Location.LocationSubscription | null = null;
    let cancelled = false;
    const startWatcher = async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== 'granted' || cancelled) return;
      watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 3000,
          timeInterval: 5 * 60 * 1000,
        },
        (position) => {
          const next: PrayerLocation = {
            mode: 'gps', label: 'Konumum',
            latitude: position.coords.latitude, longitude: position.coords.longitude,
          };
          const previous = lastLoadedLocation.current;
          const movedEnough = !previous || previous.mode !== 'gps' || previous.latitude == null || previous.longitude == null || Math.abs(previous.latitude - next.latitude) > 0.03 || Math.abs(previous.longitude - next.longitude) > 0.03;
          setGpsLocation(next);
          if (movedEnough) void refresh(next);
        },
      );
    };
    void startWatcher();
    return () => { cancelled = true; watcher?.remove(); };
  }, [preferences.useGps, refresh]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (preferences.useGps && !gpsLocation) return;
    void refresh();
  }, [preferences.useGps, gpsLocation, refresh]);

  const next = useMemo(() => (data ? getNextPrayer(now, data.timings) : null), [data, now]);
  const countdown = next ? formatCountdown(next.target.getTime() - now.getTime()) : '--:--:--';

  return { data, error, loading, refresh, useCurrentLocation, next, countdown, activeLocation };
}
