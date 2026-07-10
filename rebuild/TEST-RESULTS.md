# DuaVakti 1.5.0 — Test Sonuçları

Testler temiz bir kopyada, `node_modules`, `android`, `.expo` ve önceki build çıktıları olmadan başlatıldı.

## Temiz kurulum

- `npm ci`: PASS
- Kurulan paket: 481
- Paket kilidinde özel/iç npm registry adresi: 0

## TypeScript ve mantık testleri

- `npm run typecheck`: PASS
- Mantık testleri: 29/29 PASS
- Bildirim planı yalnız gelecekteki vakitleri seçiyor: PASS
- Bildirim planı tarih sırasını koruyor: PASS
- Namaz vakti, kıble, Kur’an normalizasyonu, dua ve zaman testleri: PASS

## Statik doğrulama

- `npm run verify`: 92/92 PASS
- `expo-notifications` bağımlılığı ve config plugin: PASS
- Android `POST_NOTIFICATIONS` izni: PASS
- 7 günlük ezan planlama akışı: PASS
- Kur’an unmount sırasında elle native player durdurma kaldırıldı: PASS
- Kur’an geç async sonuç koruması: PASS
- Dört widget saatlik güncelleme aralığı: PASS
- Widget duası yerel saate göre değişiyor: PASS

## Android prebuild / native doğrulama

- `npx expo prebuild --platform android --clean`: PASS
- `npm run verify:prebuild`: 14/14 PASS
- Expo autolinking yerel widget modülünü buldu: PASS
- Widget manifestinde 4 receiver: PASS
- Dört widget provider XML dosyası: PASS
- Üretilen ana Android manifestinde `POST_NOTIFICATIONS`: PASS

## Android JS/Hermes paketi

- `npx expo export --platform android`: PASS
- Metro/Hermes modül sayısı: 688

## Tam Gradle APK derlemesi

- `./gradlew :app:assembleRelease` denendi.
- Kaynak/Gradle hatasına gelmeden önce çalışma ortamı `services.gradle.org` adresini DNS ile çözemediği için Gradle 9.3.1 dağıtımı indirilemedi.
- Bu nedenle son gerçek APK derlemesi EAS Build üzerinde yapılmalıdır.
