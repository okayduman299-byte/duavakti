import { Alert, AppState, Linking } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Location from 'expo-location';
import type { AppPreferences, PrayerApiResult, PrayerLocation } from '../types';
import { loadPrayerTimes } from '../lib/prayerService';
import { getNextPrayer } from '../lib/prayer';
import { formatCountdown } from '../lib/time';
import { readJson } from '../lib/storage';
import { startAutomaticLocationTracking } from '../native/locationTask';

const LAST_LOCATION_KEY = 'duavakti:last-background-location:v1';

function showBackgroundLocationWarning() {
  Alert.alert(
    'Arka plan konum izni gerekli',
    'DuaVakti, bulunduğun şehir değiştiğinde namaz vakitlerini otomatik güncelleyebilmek için konumuna arka planda erişebilmelidir. Lütfen konum iznini "Her zaman izin ver" olarak ayarla.',
    [
      { text: 'Daha sonra', style: 'cancel' },
      { text: 'Ayarlara git', onPress: () => void Linking.openSettings() },
    ],
  );
}

export function usePrayerData(preferences: AppPreferences, onGpsEnabled: (enabled: boolean) => void) {
  const [data, setData] = useState<PrayerApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [gpsLocation, setGpsLocation] = useState<PrayerLocation | null>(null);
  const lastLoadedLocation = useRef<PrayerLocation | null>(null);

  const cityLocation = useMemo<PrayerLocation>(() => ({
    mode: 'city', label: preferences.city || 'Muradiye', city: preferences.city || 'Muradiye', country: preferences.country || 'Turkey',
  }), [preferences.city, preferences.country]);

  const activeLocation = preferences.useGps && gpsLocation ? gpsLocation : cityLocation;

  const refresh = useCallback(async (locationOverride?: PrayerLocation) => {
    setLoading(true); setError(null);
    try {
      const location = locationOverride ?? activeLocation;
      const result = await loadPrayerTimes(new Date(), location);
      setData(result); lastLoadedLocation.current = location;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vakitler alınamadı.');
    } finally { setLoading(false); }
  }, [activeLocation]);

  const useCurrentLocation = useCallback(async () => {
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      const foregroundPermission = foreground.status === 'granted'
        ? foreground
        : await Location.requestForegroundPermissionsAsync();

      if (foregroundPermission.status !== 'granted') {
        setError('Konum izni verilmedi. Şehir ayarıyla devam ediliyor.');
        onGpsEnabled(false);
        return false;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const next: PrayerLocation = { mode: 'gps', label: 'Konumum', latitude, longitude };
      setGpsLocation(next);
      onGpsEnabled(true);

      const background = await Location.getBackgroundPermissionsAsync();
      const backgroundPermission = background.status === 'granted'
        ? background
        : await Location.requestBackgroundPermissionsAsync();

      if (backgroundPermission.status !== 'granted') {
        showBackgroundLocationWarning();
        return true;
      }

      const trackingStarted = await startAutomaticLocationTracking();
      if (!trackingStarted) {
        showBackgroundLocationWarning();
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

  useEffect(() => {
    if (!preferences.useGps) return;
    void readJson<PrayerLocation>(LAST_LOCATION_KEY).then((stored) => {
      if (!stored || stored.latitude == null || stored.longitude == null) return;
      setGpsLocation(stored); void refresh(stored);
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
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 3000, timeInterval: 5 * 60 * 1000 },
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const next: PrayerLocation = { mode: 'gps', label: 'Konumum', latitude, longitude };
          const previous = lastLoadedLocation.current;
          const movedEnough = !previous || previous.mode !== 'gps' || previous.latitude == null || previous.longitude == null || Math.abs(previous.latitude - latitude) > 0.03 || Math.abs(previous.longitude - longitude) > 0.03;
          setGpsLocation(next); if (movedEnough) void refresh(next);
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
