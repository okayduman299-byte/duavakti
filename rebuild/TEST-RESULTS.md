# DuaVakti 1.3.0 — Test Sonuçları

## Temiz paket doğrulaması

Temiz kaynak kopyasında sıfırdan çalıştırıldı:

- `npm ci --include=dev`: PASS — 478 paket
- TypeScript `tsc --noEmit`: PASS
- Mantık testleri: PASS — 19/19
- Statik proje doğrulaması: PASS — 60/60
- Expo Android prebuild: PASS
- Expo Autolinking: PASS
- Native/prebuild doğrulaması: PASS — 14/14
- Android Hermes/Metro export: PASS — 623 modül
- Android widget XML parse: PASS — 11 XML dosyası
- Kotlin `R.id` → layout ID eşleşmesi: PASS — 18 referans, 0 eksik
- Manifest `@xml` provider kaynak eşleşmesi: PASS

## Regresyon kontrolleri

### Dualar ekranı

- İlk açılışta `FlatList` kullanılmıyor.
- Sekme bazlı `ErrorBoundary` etkin.
- Bölüm hatası alt navigasyonu kapatmıyor.

### Dua widgetı

- 4 receiver manifestte kayıtlı.
- Yeni `DuaVaktiDuaWidget` sınıfı mevcut.
- `duavakti_widget_dua.xml` layoutı mevcut ve parse ediliyor.
- `duavakti_widget_dua_info.xml` provider tanımı mevcut.
- Native köprü dua listesini kaydediyor.
- Widget günlük dua verisini okuyor.

### Kur’an otomatik okuma

- Expo Audio playlist API bağlı.
- Suredeki sesli ayetler playlist içine ekleniyor.
- Tek ayetten başlatma `skipTo` ile doğru sıraya geçiyor.
- Playlist `loop: none` ile son ayette duruyor.
- Tümünü dinle / duraklat / devam et / baştan dinle akışları kaynakta doğrulandı.

## Tam Gradle APK sınırı

Yerel `./gradlew :app:assembleRelease` denemesi uygulama hatası nedeniyle değil, çalışma ortamının `services.gradle.org` adresini çözememesi nedeniyle başlayamadı (`UnknownHostException`). Bu yüzden son APK derlemesi EAS Build üzerinde yapılmalıdır.
