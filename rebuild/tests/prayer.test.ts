import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanPrayerTime,
  getNextPrayer,
  normalizePrayerTimes,
  prayerRows,
  qiblaBearing,
  timeOnDate,
} from '../src/lib/prayer';
import type { PrayerTimes } from '../src/types';

const timings: PrayerTimes = {
  Fajr: '05:10',
  Dhuhr: '13:15',
  Asr: '17:20',
  Maghrib: '20:40',
  Isha: '22:15',
};

test('cleanPrayerTime API eklerini temizler', () => {
  assert.equal(cleanPrayerTime('3:09 (+03)'), '03:09');
  assert.equal(cleanPrayerTime('22:28 (EEST)'), '22:28');
  assert.equal(cleanPrayerTime(null), '--:--');
});

test('normalizePrayerTimes gerekli beş vakti normalize eder', () => {
  assert.deepEqual(
    normalizePrayerTimes({ Fajr: '5:10', Dhuhr: '13:15', Asr: '17:20', Maghrib: '20:40', Isha: '22:15' }),
    timings,
  );
});

test('getNextPrayer gün içindeki sıradaki vakti bulur', () => {
  const now = new Date(2026, 6, 9, 14, 0, 0);
  const next = getNextPrayer(now, timings);
  assert.equal(next.key, 'Asr');
  assert.equal(next.label, 'İkindi');
  assert.equal(next.time, '17:20');
});

test('getNextPrayer yatsıdan sonra ertesi gün sabaha döner', () => {
  const now = new Date(2026, 6, 9, 23, 0, 0);
  const next = getNextPrayer(now, timings);
  assert.equal(next.key, 'Fajr');
  assert.equal(next.target.getDate(), 10);
  assert.equal(next.target.getHours(), 5);
  assert.equal(next.target.getMinutes(), 10);
});

test('timeOnDate geçersiz saatleri reddeder', () => {
  assert.equal(timeOnDate(new Date(2026, 0, 1), '25:00'), null);
  assert.equal(timeOnDate(new Date(2026, 0, 1), '--:--'), null);
});

test('prayerRows sıralamayı sabit tutar', () => {
  assert.deepEqual(prayerRows(timings).map((row) => row.label), ['Sabah', 'Öğle', 'İkindi', 'Akşam', 'Yatsı']);
});

test('qiblaBearing sonucu 0-360 aralığındadır', () => {
  const bearing = qiblaBearing(41.0082, 28.9784);
  assert.ok(bearing >= 0 && bearing < 360);
  assert.ok(bearing > 140 && bearing < 170, `İstanbul için beklenmeyen açı: ${bearing}`);
});
