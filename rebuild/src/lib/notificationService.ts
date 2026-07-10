import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { PrayerApiResult, PrayerLocation } from '../types';
import { loadPrayerTimes } from './prayerService';
import { buildPrayerNotificationPlan, type PrayerNotificationDay } from './notificationPlan';
import { toDateKey } from './time';

export const PRAYER_NOTIFICATION_CHANNEL = 'prayer-times';
const DAYS_TO_SCHEDULE = 7;
const PRAYER_NOTIFICATION_KIND = 'prayer-time';

async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(PRAYER_NOTIFICATION_CHANNEL, {
    name: 'Ezan vakti uyarıları',
    description: 'Namaz vakti girdiğinde bildirim gösterir.',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 400, 220, 400],
    sound: 'default',
  });
}

async function hasNotificationPermission(): Promise<boolean> {
  await ensureNotificationChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

async function cancelPrayerNotifications(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.content.data?.kind === PRAYER_NOTIFICATION_KIND)
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export async function syncPrayerNotifications({
  enabled,
  location,
  todayData,
  now = new Date(),
}: {
  enabled: boolean;
  location: PrayerLocation;
  todayData?: PrayerApiResult | null;
  now?: Date;
}): Promise<number> {
  if (!enabled) {
    await cancelPrayerNotifications();
    return 0;
  }
  if (!(await hasNotificationPermission())) return 0;

  const dayZero = startOfLocalDay(now);
  const days: PrayerNotificationDay[] = [];

  for (let offset = 0; offset < DAYS_TO_SCHEDULE; offset += 1) {
    const date = new Date(dayZero);
    date.setDate(date.getDate() + offset);
    const dateKey = toDateKey(date);
    try {
      const result =
        offset === 0 && todayData?.dateKey === dateKey
          ? todayData
          : await loadPrayerTimes(date, location);
      days.push({ date, result });
    } catch {
      // Bir günün servisi geçici olarak alınamazsa diğer günlerin uyarıları korunur.
    }
  }

  const plan = buildPrayerNotificationPlan(days, now);
  if (!plan.length) return 0;

  await cancelPrayerNotifications();
  for (const item of plan) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.title,
        body: item.body,
        sound: 'default',
        data: {
          kind: PRAYER_NOTIFICATION_KIND,
          prayer: item.key,
          scheduleId: item.id,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.target,
        channelId: PRAYER_NOTIFICATION_CHANNEL,
      },
    });
  }

  return plan.length;
}
