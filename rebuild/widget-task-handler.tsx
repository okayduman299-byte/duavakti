import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { DuaVaktiWidget } from './src/widgets/DuaVaktiWidget';
import { loadPrayerTimes } from './src/lib/prayerService';
import { getNextPrayer } from './src/lib/prayer';
import { formatCountdown } from './src/lib/time';
import { readJson } from './src/lib/storage';
import type { AppPreferences, PrayerTimes } from './src/types';

const PREFS_KEY = 'duavakti:preferences:v1';
const CACHE_KEY = 'duavakti:widget-cache:v1';
const DEFAULT_CITY = 'Muradiye';
const EMPTY_TIMINGS: PrayerTimes = { Fajr: '--:--', Dhuhr: '--:--', Asr: '--:--', Maghrib: '--:--', Isha: '--:--' };

type WidgetCache = { city: string; timings: PrayerTimes; savedAt: number };

function renderWidget(renderWidgetFn: (widget: React.ReactElement) => void, city: string, timings: PrayerTimes) {
  const next = getNextPrayer(new Date(), timings);
  const remaining = next.target.getTime() > Date.now() ? formatCountdown(next.target.getTime() - Date.now()) : 'Vakit';
  renderWidgetFn(<DuaVaktiWidget city={city} timings={timings} nextLabel={next.label} nextTime={next.time} remaining={remaining} />);
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== 'DuaVakti') return;
  if (props.widgetAction !== 'WIDGET_ADDED' && props.widgetAction !== 'WIDGET_UPDATE' && props.widgetAction !== 'WIDGET_RESIZED') return;

  const stored = await readJson<AppPreferences>(PREFS_KEY);
  const cached = await readJson<WidgetCache>(CACHE_KEY);
  const city = stored?.city || cached?.city || DEFAULT_CITY;

  // Show something immediately, then replace it with fresh data if network works.
  renderWidget(props.renderWidget, city, cached?.timings || EMPTY_TIMINGS);

  try {
    const data = await loadPrayerTimes(new Date(), { mode: 'city', label: city, city, country: stored?.country || 'Turkey' });
    renderWidget(props.renderWidget, city, data.timings);
  } catch {
    // Keep cached/placeholder content instead of leaving the widget blank.
  }
}
