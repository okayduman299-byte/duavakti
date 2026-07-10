import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import type { PrayerLocation } from '../types';
import { qiblaBearing } from '../lib/prayer';
import { angularDistance, relativeQiblaAngle, smoothHeading } from '../lib/qibla';
import { colors, radii } from '../theme';

type Coordinates = { latitude: number; longitude: number };

function accuracyLabel(value: number | null): string {
  if (value == null) return 'Pusula hazırlanıyor';
  if (value >= 3) return 'Pusula doğruluğu yüksek';
  if (value === 2) return 'Pusula doğruluğu orta';
  if (value === 1) return 'Pusula doğruluğu düşük';
  return 'Telefonu sekiz çizerek kalibre et';
}

export function QiblaCompass({ activeLocation }: { activeLocation: PrayerLocation }) {
  const [coords, setCoords] = useState<Coordinates | null>(() => {
    if (activeLocation.latitude == null || activeLocation.longitude == null) return null;
    return { latitude: activeLocation.latitude, longitude: activeLocation.longitude };
  });
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    if (activeLocation.latitude != null && activeLocation.longitude != null) {
      setCoords({ latitude: activeLocation.latitude, longitude: activeLocation.longitude });
    }
  }, [activeLocation.latitude, activeLocation.longitude]);

  useEffect(() => {
    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    const start = async () => {
      setError(null);
      try {
        let permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          permission = await Location.requestForegroundPermissionsAsync();
        }
        if (permission.status !== 'granted') {
          if (!cancelled) setError('Kıble pusulası için konum izni gerekiyor.');
          return;
        }

        if (!coords) {
          const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000, requiredAccuracy: 5000 });
          const position = lastKnown ?? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (!cancelled) {
            setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          }
        }

        subscription = await Location.watchHeadingAsync(
          (value) => {
            const raw = value.trueHeading >= 0 ? value.trueHeading : value.magHeading;
            if (!Number.isFinite(raw)) return;
            setHeading((previous) => smoothHeading(previous, raw));
            setAccuracy(value.accuracy);
          },
          (reason) => {
            if (!cancelled) setError(`Pusula okunamadı: ${reason}`);
          },
        );
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Kıble pusulası başlatılamadı.');
        }
      }
    };

    void start();
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [restartKey]);

  const bearing = useMemo(() => {
    if (!coords) return null;
    return qiblaBearing(coords.latitude, coords.longitude);
  }, [coords]);

  const rotation = bearing != null && heading != null ? relativeQiblaAngle(bearing, heading) : 0;
  const aligned = bearing != null && heading != null && angularDistance(rotation, 0) <= 5;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Canlı kıble pusulası</Text>
          <Text style={styles.help}>Telefonu düz tut ve kendi ekseni etrafında döndür. Ok, Kâbe yönünü telefonla birlikte takip eder.</Text>
        </View>
        {bearing != null ? <Text style={styles.bearing}>{Math.round(bearing)}°</Text> : null}
      </View>

      <View style={[styles.compass, aligned && styles.compassAligned]}>
        <Text style={[styles.cardinal, styles.north]}>K</Text>
        <Text style={[styles.cardinal, styles.east]}>D</Text>
        <Text style={[styles.cardinal, styles.south]}>G</Text>
        <Text style={[styles.cardinal, styles.west]}>B</Text>
        <View style={[styles.needleWrap, { transform: [{ rotate: `${rotation}deg` }] }]}>
          <Text style={styles.kaaba}>◆</Text>
          <View style={styles.needle} />
          <View style={styles.needleDot} />
        </View>
      </View>

      {aligned ? <Text style={styles.aligned}>✓ Kıble yönündesin</Text> : null}
      {!aligned && !error ? <Text style={styles.status}>{accuracyLabel(accuracy)}</Text> : null}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retry} onPress={() => setRestartKey((value) => value + 1)}>
            <Text style={styles.retryText}>Tekrar dene</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 18, marginBottom: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  titleWrap: { flex: 1, paddingRight: 12 },
  title: { color: colors.text, fontSize: 17, fontWeight: '900' },
  help: { color: colors.textMuted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  bearing: { color: colors.accent, fontSize: 24, fontWeight: '900' },
  compass: { width: 238, height: 238, borderRadius: 119, borderWidth: 2, borderColor: colors.borderStrong, alignSelf: 'center', marginTop: 22, backgroundColor: colors.greenCard, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  compassAligned: { borderColor: colors.accent, borderWidth: 3 },
  cardinal: { position: 'absolute', color: colors.textMuted, fontSize: 14, fontWeight: '900' },
  north: { top: 13 },
  east: { right: 17, top: 108 },
  south: { bottom: 13 },
  west: { left: 17, top: 108 },
  needleWrap: { width: 72, height: 190, alignItems: 'center', justifyContent: 'flex-start' },
  kaaba: { color: colors.accent, fontSize: 25, lineHeight: 30 },
  needle: { width: 4, height: 64, backgroundColor: colors.accent, borderRadius: 4, marginTop: 2 },
  needleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.text, borderWidth: 5, borderColor: colors.accentSoft, marginTop: -2 },
  aligned: { color: colors.accent, fontSize: 15, fontWeight: '900', textAlign: 'center', marginTop: 16 },
  status: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 16 },
  errorBox: { marginTop: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.md, padding: 14 },
  errorText: { color: colors.text, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retry: { alignSelf: 'center', marginTop: 10, paddingHorizontal: 16, paddingVertical: 9, backgroundColor: colors.greenCard, borderRadius: 14 },
  retryText: { color: colors.text, fontWeight: '800' },
});
