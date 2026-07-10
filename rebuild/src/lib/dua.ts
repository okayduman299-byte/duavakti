import type { DuaItem } from '../types';

export function getDailyDua(duas: DuaItem[], date = new Date()): DuaItem | null {
  if (!duas.length) return null;
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return duas[(Math.max(dayOfYear, 1) - 1) % duas.length] ?? duas[0] ?? null;
}
