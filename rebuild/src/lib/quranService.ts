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
const SURAH_PREFIX = 'duavakti:quran:surah:v2:';

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

export async function loadSurah(number: number): Promise<{ data: SurahContent; source: 'network' | 'cache' }> {
  const key = `${SURAH_PREFIX}${number}`;
  try {
    const payload = await fetchJson(
      `https://api.alquran.cloud/v1/surah/${number}/editions/quran-uthmani,tr.diyanet,ar.alafasy`,
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
