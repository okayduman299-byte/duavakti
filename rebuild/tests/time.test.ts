import test from 'node:test';
import assert from 'node:assert/strict';
import { dayIndex, formatCountdown, pad2, toApiDate, toDateKey } from '../src/lib/time';

test('pad2 iki haneli çıktı üretir', () => {
  assert.equal(pad2(3), '03');
  assert.equal(pad2(12), '12');
});

test('tarih formatları beklenen servis biçimlerindedir', () => {
  const date = new Date(2026, 6, 9, 12, 0, 0);
  assert.equal(toDateKey(date), '2026-07-09');
  assert.equal(toApiDate(date), '09-07-2026');
});

test('formatCountdown negatif süreyi sıfırda tutar', () => {
  assert.equal(formatCountdown(-1000), '00:00:00');
  assert.equal(formatCountdown(3 * 3600_000 + 15 * 60_000 + 8_000), '03:15:08');
});

test('dayIndex her zaman dizi aralığında kalır', () => {
  const index = dayIndex(new Date(2026, 6, 9), 7);
  assert.ok(index >= 0 && index < 7);
  assert.equal(dayIndex(new Date(), 0), 0);
});
