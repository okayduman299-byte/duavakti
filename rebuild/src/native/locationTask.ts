import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { readJson, writeJson } from '../lib/storage';
import { loadPrayerTimes } from '../lib/prayerService';
import { syncPrayerNotifications } from '../lib/notificationService';
import type { AppPreferences, PrayerLocation } from '../types';

export const BACKGROUND_LOCATION_TASK = 'duavakti-background-location';
const LAST_LOCATION_KEY = 'duavakti:last-background-location:v1';
const PREFS_KEY = 'duavakti:preferences:v1';

function distanceKm(a: PrayerLocation, b: PrayerLocation): number {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) return Infinity;
  const r = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  const locations = (data as { locations?: Location.LocationObject[] } | undefined)?.locations;
  const latest = locations?.at(-1);
  if (!latest) return;

  const location: PrayerLocation = {
    mode: 'gps',
    label: 'Konumum',
    latitude: latest.coords.latitude,
    longitude: latest.coords.longitude,
  };

  const previous = await readJson<PrayerLocation>(LAST_LOCATION_KEY);
  await writeJson(LAST_LOCATION_KEY, location);

  // Only refresh when the device has moved meaningfully; this prevents
  // unnecessary API traffic while still following city-to-city travel.
  if (previous && distanceKm(previous, location) < 5) return;

  const preferences = await readJson<AppPreferences>(PREFS_KEY);
  if (preferences?.prayerNotifications === false) return;

  try {
    const today = await loadPrayerTimes(new Date(), location);
    await syncPrayerNotifications({
      enabled: true,
      location,
      todayData: today,
    });
  } catch {
    // The next background location event will retry.
  }
});

export async function startAutomaticLocationTracking(): Promise<boolean> {
  try {
    const foreground = await Location.getForegroundPermissionsAsync();
    if (foreground.status !== 'granted') return false;

    const background = await Location.getBackgroundPermissionsAsync();
    if (background.status !== 'granted') return false;

    const started = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    if (!started) {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 5000,
        timeInterval: 10 * 60 * 1000,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'DuaVakti konum takibi',
          notificationBody: 'Namaz vakitleri bulunduğun konuma göre otomatik güncelleniyor.',
          notificationColor: '#8DB89F',
        },
      });
    }
    return true;
  } catch {
    return false;
  }
}
