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

type Props = { city: string; timings: PrayerTimes; nextLabel: string; nextTime: string; remaining: string };

export function DuaVaktiWidget({ city, timings, nextLabel, nextTime, remaining }: Props) {
  return (
    <FlexWidget clickAction="OPEN_APP" accessibilityLabel={`DuaVakti ${city} namaz vakitleri`} style={{ height: 'match_parent', width: 'match_parent', backgroundColor: '#0B1711', borderRadius: 16, padding: 8, flexDirection: 'column' }}>
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextWidget text="DuaVakti" style={{ fontSize: 14, fontWeight: 'bold', color: '#F5F7F5' }} />
        <TextWidget text={` · ${city}`} style={{ width: 90, fontSize: 8, color: '#8FB59D' }} truncate="END" />
      </FlexWidget>
      <FlexWidget style={{ marginTop: 4, padding: 6, borderRadius: 10, backgroundColor: '#14271D', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
          <TextWidget text={`Sıradaki · ${nextLabel}`} style={{ fontSize: 7, color: '#8FB59D' }} truncate="END" />
          <TextWidget text={nextTime} style={{ marginTop: 1, fontSize: 19, fontWeight: 'bold', color: '#BCE2C9' }} />
        </FlexWidget>
        <TextWidget text={remaining} style={{ fontSize: 8, color: '#AABDB2' }} truncate="END" />
      </FlexWidget>
      <FlexWidget style={{ marginTop: 5, flexDirection: 'row', flex: 1, alignItems: 'center' }}>
        {rows.map((row) => (
          <FlexWidget key={row.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TextWidget text={row.label} style={{ fontSize: 6, color: '#7F9187', textAlign: 'center' }} truncate="END" />
            <TextWidget text={timings[row.key]} style={{ marginTop: 1, fontSize: 8, fontWeight: 'bold', color: '#DCE6DF', textAlign: 'center' }} />
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
