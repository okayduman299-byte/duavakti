import type { PrayerApiResult, PrayerKey } from '../types';
import { PRAYER_LABELS, PRAYER_ORDER, timeOnDate } from './prayer';

export interface PrayerNotificationDay {
  date: Date;
  result: PrayerApiResult;
}

export interface PrayerNotificationPlanItem {
  id: string;
  key: PrayerKey;
  label: string;
  target: Date;
  title: string;
  body: string;
}

export function buildPrayerNotificationPlan(
  days: PrayerNotificationDay[],
  now = new Date(),
): PrayerNotificationPlanItem[] {
  const plan: PrayerNotificationPlanItem[] = [];

  for (const { date, result } of days) {
    for (const key of PRAYER_ORDER) {
      const target = timeOnDate(date, result.timings[key]);
      if (!target || target.getTime() <= now.getTime()) continue;

      const label = PRAYER_LABELS[key];
      plan.push({
        id: `${result.dateKey}:${result.locationKey}:${key}`,
        key,
        label,
        target,
        title: `${label} vakti`,
        body: `${result.locationLabel} için ${label} vakti girdi.`,
      });
    }
  }

  return plan.sort((a, b) => a.target.getTime() - b.target.getTime());
}
