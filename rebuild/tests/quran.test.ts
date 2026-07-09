import test from 'node:test';
import assert from 'node:assert/strict';
import {
  matchesSurah,
  normalizeSearch,
  parseSurahEditionsPayload,
  parseSurahListPayload,
} from '../src/lib/quran';
import type { SurahSummary } from '../src/types';

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
