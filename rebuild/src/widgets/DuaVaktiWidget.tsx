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
        borderRadius: 18,
        padding: 14,
        flexDirection: 'column',
      }}
    >
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextWidget text="DuaVakti" style={{ fontSize: 17, fontWeight: 'bold', color: '#F5F7F5' }} />
        <TextWidget text={city} style={{ fontSize: 11, color: '#8FB59D' }} truncate="END" />
      </FlexWidget>

      <FlexWidget
        style={{
          marginTop: 7,
          padding: 9,
          borderRadius: 13,
          backgroundColor: '#14271D',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget text={`Sıradaki: ${nextLabel}`} style={{ fontSize: 10, color: '#8FB59D' }} />
          <TextWidget text={nextTime} style={{ fontSize: 25, fontWeight: 'bold', color: '#BCE2C9' }} />
        </FlexWidget>
        <TextWidget text={remaining} style={{ fontSize: 11, color: '#AABDB2' }} />
      </FlexWidget>

      <FlexWidget style={{ marginTop: 8, flexDirection: 'row' }}>
        {rows.map((row) => (
          <FlexWidget key={row.key} style={{ flex: 1, alignItems: 'center' }}>
            <TextWidget text={row.label} style={{ fontSize: 8, color: '#7F9187', textAlign: 'center' }} />
            <TextWidget text={timings[row.key]} style={{ marginTop: 2, fontSize: 10, fontWeight: 'bold', color: '#DCE6DF', textAlign: 'center' }} />
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
