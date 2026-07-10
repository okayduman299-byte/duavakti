import assert from 'node:assert/strict';
import test from 'node:test';
import { getDailyDua } from '../src/lib/dua';
import type { DuaItem } from '../src/types';

const duas: DuaItem[] = [
  { id: 'a', title: 'A', category: 'x', arabic: 'a', latin: 'a', meaning: 'A', source: 'A' },
  { id: 'b', title: 'B', category: 'x', arabic: 'b', latin: 'b', meaning: 'B', source: 'B' },
  { id: 'c', title: 'C', category: 'x', arabic: 'c', latin: 'c', meaning: 'C', source: 'C' },
];

test('günün duası aynı gün için kararlı seçilir', () => {
  const date = new Date(2026, 6, 10, 12, 0, 0);
  assert.equal(getDailyDua(duas, date)?.id, getDailyDua(duas, date)?.id);
});

test('boş dua listesi null döndürür', () => {
  assert.equal(getDailyDua([], new Date(2026, 0, 1)), null);
});

test('ardışık günler sıradaki duaya geçer', () => {
  const first = getDailyDua(duas, new Date(2026, 0, 1));
  const second = getDailyDua(duas, new Date(2026, 0, 2));
  assert.notEqual(first?.id, second?.id);
});
