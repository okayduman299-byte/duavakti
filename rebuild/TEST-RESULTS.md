# DuaVakti 1.1.2 Test Sonuçları

Tarih: 10 Temmuz 2026

## Sonuç özeti

- Temiz bağımlılık kurulumu (`npm ci --include=dev`): PASS — 480 paket
- TypeScript tam tip kontrolü: PASS
- Mantık birim testleri: 16/16 PASS
- Statik uygulama ve widget doğrulaması: 34/34 PASS
- Expo Android prebuild: PASS
- Android JavaScript/Hermes export bundle: PASS — 622 modül
- Ana uygulama manifestinde 3 widget receiver kaydı: PASS
- `android/app/src/main/res/xml` içinde 3 widget provider XML'i: PASS
- `android/app/src/main/res/layout` içinde 3 widget layout'u: PASS
- Widget drawable kaynağı ana uygulama modülünde: PASS
- Widget string kaynakları ana uygulama modülünde: PASS
- Ana uygulamanın `strings.xml` dosyası korunuyor: PASS

## EAS hatasına yönelik doğrulama

EAS logundaki gerçek hata:

`Execution failed for task ':app:processReleaseResources'`

AAPT tarafından bulunamayan ilk kaynak:

`@xml/duavakti_widget_small_info`

1.1.2 prebuild çıktısında aşağıdaki dosyalar doğrudan ana uygulama resource klasöründe doğrulandı:

- `android/app/src/main/res/xml/duavakti_widget_small_info.xml`
- `android/app/src/main/res/xml/duavakti_widget_medium_info.xml`
- `android/app/src/main/res/xml/duavakti_widget_large_info.xml`

Manifest referansları da aynı adlarla doğrulandı.

## Çalıştırılan komutlar

```text
npm ci --include=dev --no-audit --no-fund
npm run test:all
npx expo prebuild --platform android --clean --no-install
CI=1 npx expo export --platform android
```

## Sınırlama

Bu ortamda Android SDK/Gradle release APK derlemesi çalıştırılmadı. Son doğrulama EAS Build üzerinde yapılacaktır. Ancak önceki EAS hatasının eksik gördüğü üç `@xml` kaynağı artık prebuild sonrası ana uygulama modülünde fiziksel olarak mevcuttur.
