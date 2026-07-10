# DuaVakti 1.4.0 — Test Results

## Otomatik doğrulamalar

- Temiz `npm ci --offline --ignore-scripts`: PASS — 478 paket, 0 güvenlik açığı
- TypeScript (`tsc --noEmit`): PASS
- Mantık testleri: 23/23 PASS
- Statik proje doğrulaması: 74/74 PASS
- Expo Android prebuild: PASS
- Expo native module autolinking: PASS
- Prebuild/native doğrulama: 14/14 PASS
- Android Hermes/Metro export: PASS — 625 modül
- Android XML doğrulaması: 11/11 PASS
- Kotlin → `R.id` eşleşmesi: 29 referans, 0 eksik

## Özellikle doğrulanan düzeltmeler

- Dualar ekranında FlatList yok: PASS
- Dualar ekranında iç içe yatay ScrollView yok: PASS
- Dualar ekranı kimlik + kategori durumuyla çalışıyor: PASS
- Kıble pusulası `watchHeadingAsync` ile canlı yön izliyor: PASS
- Kıble açısı telefon yönüne göre hesaplanıyor: PASS
- 360° sınırında açı yumuşatma testleri: PASS
- Pusula aboneliği ekran kapanınca temizleniyor: PASS
- Küçük widget dua başlığı içeriyor: PASS
- Orta widget dua başlığı ve anlamı içeriyor: PASS
- Büyük widget dua başlığı ve anlamı içeriyor: PASS
- Küçük/orta/büyük widget Kotlin provider'ları günlük dua verisini bağlıyor: PASS

## Gradle release build sınırı

`./android/gradlew :app:assembleRelease --no-daemon` komutu başlatıldı. Kod derlemesine geçmeden önce bu çalışma ortamı dış ağa erişemediği için `services.gradle.org` üzerindeki Gradle 9.3.1 dağıtımı indirilemedi (`UnknownHostException`). Bu nedenle burada APK üretildiği iddia edilmez. Son tam APK derlemesi EAS Build üzerinde yapılmalıdır.
