import type { AyahPair, SurahContent, SurahSummary } from '../types';
import { getTurkishSurahName } from '../data/surahNames';

interface EditionSurah {
  number?: unknown;
  name?: unknown;
  englishName?: unknown;
  englishNameTranslation?: unknown;
  revelationType?: unknown;
  ayahs?: unknown;
}

interface EditionAyah {
  numberInSurah?: unknown;
  text?: unknown;
  audio?: unknown;
}

function asText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asPositiveInt(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}



export function normalizeSurahSummary(value: unknown): SurahSummary | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const number = asPositiveInt(row.number);
  if (!number || number > 114) return null;
  const numberOfAyahs = asPositiveInt(row.numberOfAyahs, 1);
  return {
    number,
    name: asText(row.name, `Sure ${number}`),
    englishName: asText(row.englishName, `Surah ${number}`),
    englishNameTranslation: asText(row.englishNameTranslation),
    turkishName: asText(row.turkishName, getTurkishSurahName(number)),
    numberOfAyahs,
    revelationType: asText(row.revelationType),
  };
}

export function normalizeCachedSurahList(value: unknown): SurahSummary[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const normalized = normalizeSurahSummary(item);
    return normalized ? [normalized] : [];
  });
}

export function normalizeCachedSurahContent(value: unknown): SurahContent | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const summary = normalizeSurahSummary(row.summary);
  if (!summary || !Array.isArray(row.ayahs)) return null;

  const ayahs = row.ayahs.flatMap((item): AyahPair[] => {
    if (!item || typeof item !== 'object') return [];
    const ayah = item as Record<string, unknown>;
    const numberInSurah = asPositiveInt(ayah.numberInSurah);
    const arabic = asText(ayah.arabic);
    if (!numberInSurah || !arabic) return [];
    const audio = asText(ayah.audio);
    return [{
      numberInSurah,
      arabic,
      translation: asText(ayah.translation),
      audio: audio || undefined,
    }];
  });

  return ayahs.length ? { summary: { ...summary, numberOfAyahs: ayahs.length }, ayahs } : null;
}

export function parseSurahListPayload(payload: unknown): SurahSummary[] {
  if (!payload || typeof payload !== 'object') return [];
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];

  return data.flatMap((item): SurahSummary[] => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    const number = asPositiveInt(row.number);
    const numberOfAyahs = asPositiveInt(row.numberOfAyahs);
    if (!number || !numberOfAyahs) return [];
    return [
      {
        number,
        name: asText(row.name, `Sure ${number}`),
        englishName: asText(row.englishName, `Surah ${number}`),
        englishNameTranslation: asText(row.englishNameTranslation),
        turkishName: getTurkishSurahName(number),
        numberOfAyahs,
        revelationType: asText(row.revelationType),
      },
    ];
  });
}

function parseAyahs(value: unknown): EditionAyah[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is EditionAyah => Boolean(item && typeof item === 'object'));
}

export function parseSurahEditionsPayload(payload: unknown): SurahContent | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data) || data.length < 2) return null;

  const arabic = data[0] as EditionSurah;
  const translation = data[1] as EditionSurah;
  const audioEdition = data[2] as EditionSurah | undefined;
  if (!arabic || !translation) return null;

  const arabicAyahs = parseAyahs(arabic.ayahs);
  const translationAyahs = parseAyahs(translation.ayahs);
  const audioAyahs = parseAyahs(audioEdition?.ayahs);
  const translationByNumber = new Map<number, string>();
  const audioByNumber = new Map<number, string>();

  for (const ayah of translationAyahs) {
    const number = asPositiveInt(ayah.numberInSurah);
    if (number) translationByNumber.set(number, asText(ayah.text));
  }

  for (const ayah of audioAyahs) {
    const number = asPositiveInt(ayah.numberInSurah);
    const audio = asText(ayah.audio);
    if (number && audio) audioByNumber.set(number, audio);
  }

  const ayahs: AyahPair[] = arabicAyahs.flatMap((ayah): AyahPair[] => {
    const numberInSurah = asPositiveInt(ayah.numberInSurah);
    const arabicText = asText(ayah.text);
    if (!numberInSurah || !arabicText) return [];
    return [
      {
        numberInSurah,
        arabic: arabicText,
        translation: translationByNumber.get(numberInSurah) ?? '',
        audio: audioByNumber.get(numberInSurah),
      },
    ];
  });

  const number = asPositiveInt(arabic.number);
  if (!number || ayahs.length === 0) return null;

  return {
    summary: {
      number,
      name: asText(arabic.name, `Sure ${number}`),
      englishName: asText(arabic.englishName, `Surah ${number}`),
      englishNameTranslation: asText(arabic.englishNameTranslation),
      turkishName: getTurkishSurahName(number),
      numberOfAyahs: ayahs.length,
      revelationType: asText(arabic.revelationType),
    },
    ayahs,
  };
}

export function normalizeSearch(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function matchesSurah(summary: SurahSummary, query: string): boolean {
  const needle = normalizeSearch(query);
  if (!needle) return true;
  const haystack = normalizeSearch(
    `${summary.number} ${summary.name} ${summary.turkishName || getTurkishSurahName(summary.number)} ${summary.englishName} ${summary.englishNameTranslation}`,
  );
  return haystack.includes(needle);
}
