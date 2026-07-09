import { useEffect, useState } from 'react';
import type { AppPreferences } from '../types';
import { readJson, writeJson } from '../lib/storage';

const KEY = 'duavakti:preferences:v1';
const defaults: AppPreferences = {
  arabicVisible: true,
  quranFontScale: 1,
  city: 'Muradiye',
  country: 'Turkey',
  useGps: false,
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<AppPreferences>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    readJson<AppPreferences>(KEY).then((stored) => {
      if (stored) setPreferences({ ...defaults, ...stored });
      setReady(true);
    });
  }, []);

  const update = (patch: Partial<AppPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      void writeJson(KEY, next);
      return next;
    });
  };

  return { preferences, update, ready };
}
