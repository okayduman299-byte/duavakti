'use no memo';
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { PrayerTimes } from '../types';

const rows: Array<{ key: keyof PrayerTimes; label: string }> = [
  { key: 'Fajr', label: 'İmsak' },
  { key: 'Dhuhr', label: 'Öğle' },
  { key: 'Asr', label: 'İkindi' },
  { key: 'Maghrib', label: 'Akşam' },
  { key: 'Isha', label: 'Yatsı' },
];

type Props = {
  city: string;
  timings: PrayerTimes;
  nextLabel: string;
  nextTime: string;
  remaining: string;
};

export function DuaVaktiWidget({ city, timings, nextLabel, nextTime, remaining }: Props) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`DuaVakti, ${city} namaz vakitleri`}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0B1711',
        borderRadius: 16,
        padding: 10,
        flexDirection: 'column',
      }}
    >
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextWidget text="DuaVakti" style={{ fontSize: 15, fontWeight: 'bold', color: '#F5F7F5' }} />
        <TextWidget text={city} style={{ fontSize: 9, color: '#8FB59D' }} truncate="END" />
      </FlexWidget>

      <FlexWidget
        style={{
          marginTop: 5,
          padding: 7,
          borderRadius: 11,
          backgroundColor: '#14271D',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget text={`Sıradaki: ${nextLabel}`} style={{ fontSize: 8, color: '#8FB59D' }} />
          <TextWidget text={nextTime} style={{ fontSize: 21, fontWeight: 'bold', color: '#BCE2C9' }} />
        </FlexWidget>
        <TextWidget text={remaining} style={{ fontSize: 9, color: '#AABDB2' }} truncate="END" />
      </FlexWidget>

      <FlexWidget style={{ marginTop: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
        {rows.map((row) => (
          <FlexWidget key={row.key} style={{ alignItems: 'center', width: '19%' }}>
            <TextWidget text={row.label} style={{ fontSize: 7, color: '#7F9187', textAlign: 'center' }} />
            <TextWidget text={timings[row.key]} style={{ marginTop: 1, fontSize: 9, fontWeight: 'bold', color: '#DCE6DF', textAlign: 'center' }} />
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
