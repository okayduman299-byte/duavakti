export function normalizeDegrees(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function signedAngleDelta(from: number, to: number): number {
  return ((normalizeDegrees(to) - normalizeDegrees(from) + 540) % 360) - 180;
}

export function angularDistance(a: number, b: number): number {
  return Math.abs(signedAngleDelta(a, b));
}

export function relativeQiblaAngle(qiblaBearing: number, deviceHeading: number): number {
  return normalizeDegrees(qiblaBearing - deviceHeading);
}

export function smoothHeading(previous: number | null, next: number, factor = 0.28): number {
  const cleanNext = normalizeDegrees(next);
  if (previous == null || !Number.isFinite(previous)) return cleanNext;
  const safeFactor = Math.min(1, Math.max(0, factor));
  return normalizeDegrees(previous + signedAngleDelta(previous, cleanNext) * safeFactor);
}
