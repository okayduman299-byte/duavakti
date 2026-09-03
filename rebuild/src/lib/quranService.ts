import type { SurahContent, SurahSummary } from '../types';
import { fetchJson } from './api';
import {
  normalizeCachedSurahContent,
  normalizeCachedSurahList,
  parseSurahEditionsPayload,
  parseSurahListPayload,
} from './quran';
import { readJson, writeJson } from './storage';

const LIST_KEY = 'duavakti:quran:list:v2';
const SURAH_PREFIX = 'duavakti:quran:surah:v3:';

export interface QuranReciter {
  identifier: string;
  name: string;
  englishName: string;
}

export async function loadSurahList(): Promise<{ data: SurahSummary[]; source: 'network' | 'cache' }> {
  try {
    const payload = await fetchJson('https://api.alquran.cloud/v1/surah');
    const data = parseSurahListPayload(payload);
    if (data.length !== 114) throw new Error('Sure listesi eksik');
    await writeJson(LIST_KEY, data);
    return { data, source: 'network' };
  } catch (error) {
    const cached = normalizeCachedSurahList(await readJson<unknown>(LIST_KEY));
    if (cached.length) return { data: cached, source: 'cache' };
    throw error;
  }
}

export async function loadReciters(): Promise<QuranReciter[]> {
  const payload = await fetchJson('https://api.alquran.cloud/v1/edition/format/audio');
  const data = Array.isArray((payload as { data?: unknown }).data) ? (payload as { data: Array<Record<string, unknown>> }).data : [];
  const seen = new Set<string>();
  return data
    .filter((item) => item.type === 'versebyverse' && item.language === 'ar')
    .map((item) => ({
      identifier: typeof item.identifier === 'string' ? item.identifier : '',
      name: typeof item.name === 'string' ? item.name : 'Kur’an okuyucusu',
      englishName: typeof item.englishName === 'string' ? item.englishName : '',
    }))
    .filter((item) => {
      if (!item.identifier || seen.has(item.identifier)) return false;
      seen.add(item.identifier);
      return true;
    })
    .slice(0, 18);
}

export async function loadSurah(number: number, audioEdition = 'ar.alafasy'): Promise<{ data: SurahContent; source: 'network' | 'cache' }> {
  const safeEdition = audioEdition.replace(/[^a-zA-Z0-9._-]/g, '');
  const key = `${SURAH_PREFIX}${number}:${safeEdition}`;
  try {
    const payload = await fetchJson(
      `https://api.alquran.cloud/v1/surah/${number}/editions/quran-uthmani,tr.diyanet,${safeEdition}`,
    );
    const data = parseSurahEditionsPayload(payload);
    if (!data) throw new Error('Sure verisi çözümlenemedi');
    await writeJson(key, data);
    return { data, source: 'network' };
  } catch (error) {
    const cached = normalizeCachedSurahContent(await readJson<unknown>(key));
    if (cached) return { data: cached, source: 'cache' };
    throw error;
  }
}
