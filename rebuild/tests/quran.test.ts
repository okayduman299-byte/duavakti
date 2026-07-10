import test from 'node:test';
import assert from 'node:assert/strict';
import {
  matchesSurah,
  normalizeSearch,
  normalizeCachedSurahContent,
  normalizeCachedSurahList,
  normalizeSurahSummary,
  parseSurahEditionsPayload,
  parseSurahListPayload,
} from '../src/lib/quran';
import type { SurahSummary } from '../src/types';
import { getTurkishRevelationType } from '../src/data/surahNames';

const fatiha: SurahSummary = {
  number: 1,
  name: 'سُورَةُ ٱلْفَاتِحَةِ',
  englishName: 'Al-Faatiha',
  englishNameTranslation: 'The Opening',
  turkishName: 'Fâtiha',
  numberOfAyahs: 7,
  revelationType: 'Meccan',
};

test('parseSurahListPayload bozuk satırları atlar ve Türkçe adı ekler', () => {
  const result = parseSurahListPayload({
    data: [
      { ...fatiha },
      null,
      { number: 2, numberOfAyahs: 0 },
    ],
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].number, 1);
  assert.equal(result[0].turkishName, 'Fâtiha');
});

test('parseSurahListPayload geçersiz gövde için boş liste döner', () => {
  assert.deepEqual(parseSurahListPayload(null), []);
  assert.deepEqual(parseSurahListPayload({ data: 'nope' }), []);
});

test('parseSurahEditionsPayload Arapça, meali ve sesi ayet numarasına göre eşler', () => {
  const parsed = parseSurahEditionsPayload({
    data: [
      {
        number: 1,
        name: fatiha.name,
        englishName: fatiha.englishName,
        englishNameTranslation: fatiha.englishNameTranslation,
        revelationType: 'Meccan',
        ayahs: [
          { numberInSurah: 1, text: 'بِسْمِ اللّٰهِ' },
          { numberInSurah: 2, text: 'الْحَمْدُ لِلّٰهِ' },
        ],
      },
      {
        ayahs: [
          { numberInSurah: 2, text: 'Hamd Allah’a mahsustur.' },
          { numberInSurah: 1, text: 'Rahmân ve Rahîm olan Allah’ın adıyla.' },
        ],
      },
      {
        ayahs: [
          { numberInSurah: 1, audio: 'https://cdn.example/1.mp3' },
          { numberInSurah: 2, audio: 'https://cdn.example/2.mp3' },
        ],
      },
    ],
  });

  assert.ok(parsed);
  assert.equal(parsed.ayahs.length, 2);
  assert.equal(parsed.ayahs[0].translation, 'Rahmân ve Rahîm olan Allah’ın adıyla.');
  assert.equal(parsed.ayahs[0].audio, 'https://cdn.example/1.mp3');
  assert.equal(parsed.ayahs[1].translation, 'Hamd Allah’a mahsustur.');
});

test('parseSurahEditionsPayload eksik veriyle çökmek yerine null döner', () => {
  assert.equal(parseSurahEditionsPayload({ data: [] }), null);
  assert.equal(parseSurahEditionsPayload({ data: [{ number: 1, ayahs: [] }, { ayahs: [] }] }), null);
});

test('Türkçe arama aksan ve büyük-küçük harfe dayanıklıdır', () => {
  assert.equal(normalizeSearch(' İKİNDİ '), 'ikindi');
  assert.equal(matchesSurah(fatiha, 'fatiha'), true);
  assert.equal(matchesSurah(fatiha, '1'), true);
  assert.equal(matchesSurah(fatiha, 'bakara'), false);
});


test('normalizeSurahSummary eksik eski önbellek alanlarını güvenli varsayılanlarla tamamlar', () => {
  const result = normalizeSurahSummary({ number: 1, name: 'الفاتحة' });
  assert.ok(result);
  assert.equal(result.turkishName, 'Fâtiha');
  assert.equal(result.numberOfAyahs, 1);
  assert.equal(result.revelationType, '');
});

test('normalizeCachedSurahList bozuk önbellek satırlarını atlar', () => {
  const result = normalizeCachedSurahList([fatiha, null, { number: 'x' }]);
  assert.equal(result.length, 1);
  assert.equal(result[0].number, 1);
});

test('normalizeCachedSurahContent bozuk ayetleri atıp geçerli içeriği korur', () => {
  const result = normalizeCachedSurahContent({
    summary: { number: 1, name: 'الفاتحة' },
    ayahs: [
      { numberInSurah: 1, arabic: 'بِسْمِ اللّٰهِ', translation: 'Rahmân ve Rahîm olan Allah’ın adıyla.' },
      null,
      { numberInSurah: 2, arabic: '' },
    ],
  });
  assert.ok(result);
  assert.equal(result.ayahs.length, 1);
  assert.equal(result.summary.numberOfAyahs, 1);
});

test('vahiy yeri etiketi eksik değerde çökmek yerine Mekke döner', () => {
  assert.equal(getTurkishRevelationType(undefined), 'Mekke');
  assert.equal(getTurkishRevelationType('Medinan'), 'Medine');
});
