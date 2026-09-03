import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { DuaVaktiWidget } from './src/widgets/DuaVaktiWidget';
import { loadPrayerTimes } from './src/lib/prayerService';
import { getNextPrayer } from './src/lib/prayer';
import { formatCountdown } from './src/lib/time';
import { readJson } from './src/lib/storage';
import type { AppPreferences } from './src/types';

const PREFS_KEY = 'duavakti:preferences:v1';
const DEFAULT_CITY = 'Muradiye';

async function renderDuaVaktiWidget(renderWidget: (widget: React.ReactElement) => void) {
  const stored = await readJson<AppPreferences>(PREFS_KEY);
  const city = stored?.city || DEFAULT_CITY;
  const country = stored?.country || 'Turkey';
  const data = await loadPrayerTimes(new Date(), {
    mode: 'city',
    label: city,
    city,
    country,
  });
  const next = getNextPrayer(new Date(), data.timings);
  const remaining = formatCountdown(next.target.getTime() - Date.now());

  renderWidget(
    <DuaVaktiWidget
      city={city}
      timings={data.timings}
      nextLabel={next.label}
      nextTime={next.time}
      remaining={remaining}
    />
  );
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== 'DuaVakti') return;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      try {
        await renderDuaVaktiWidget(props.renderWidget);
      } catch {
        props.renderWidget(
          <DuaVaktiWidget
            city={DEFAULT_CITY}
            timings={{ Fajr: '--:--', Dhuhr: '--:--', Asr: '--:--', Maghrib: '--:--', Isha: '--:--' }}
            nextLabel="Vakitler"
            nextTime="--:--"
            remaining="Yükleniyor"
          />
        );
      }
      break;
    case 'WIDGET_CLICK':
    case 'WIDGET_DELETED':
    default:
      break;
  }
}
