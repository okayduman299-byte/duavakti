import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPrayerNotificationPlan } from '../src/lib/notificationPlan';
import type { PrayerApiResult } from '../src/types';

const result: PrayerApiResult = {
  dateKey: '2026-07-10',
  locationKey: 'city:Muradiye:Turkey',
  locationLabel: 'Muradiye',
  timings: {
    Fajr: '03:40',
    Dhuhr: '13:13',
    Asr: '17:11',
    Maghrib: '20:42',
    Isha: '22:28',
  },
  source: 'network',
};

test('bildirim planı yalnız gelecekteki vakitleri ekler', () => {
  const now = new Date(2026, 6, 10, 14, 0, 0);
  const plan = buildPrayerNotificationPlan([{ date: new Date(2026, 6, 10), result }], now);
  assert.deepEqual(plan.map((item) => item.label), ['İkindi', 'Akşam', 'Yatsı']);
});

test('bildirim planı tarih sırasını korur', () => {
  const now = new Date(2026, 6, 10, 0, 0, 0);
  const plan = buildPrayerNotificationPlan([{ date: new Date(2026, 6, 10), result }], now);
  assert.equal(plan.length, 5);
  assert.ok(plan.every((item, index) => index === 0 || plan[index - 1].target <= item.target));
  assert.equal(plan[0].title, 'Sabah vakti');
});
