import test from 'node:test';
import assert from 'node:assert/strict';
import { angularDistance, normalizeDegrees, relativeQiblaAngle, signedAngleDelta, smoothHeading } from '../src/lib/qibla';

test('dereceler 0-360 aralığına normalize edilir', () => {
  assert.equal(normalizeDegrees(370), 10);
  assert.equal(normalizeDegrees(-10), 350);
});

test('kıble oku telefon yönüne göre döner', () => {
  assert.equal(relativeQiblaAngle(120, 20), 100);
  assert.equal(relativeQiblaAngle(10, 350), 20);
});

test('açı farkı 360 sınırında en kısa yolu kullanır', () => {
  assert.equal(signedAngleDelta(350, 10), 20);
  assert.equal(signedAngleDelta(10, 350), -20);
  assert.equal(angularDistance(355, 5), 10);
});

test('pusula yumuşatma 360 sınırında ters yöne sıçramaz', () => {
  const smoothed = smoothHeading(350, 10, 0.5);
  assert.equal(smoothed, 0);
});
