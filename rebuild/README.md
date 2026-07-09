# DuaVakti 1.1.0

DuaVakti, namaz vakitleri, Kur’an okuma/dinleme, dualar ve Android ana ekran widgetları içeren Expo/React Native uygulamasıdır.

## 1.1.0 yenilikleri

- Widget kayıt sistemi yeniden düzenlendi. Üç Android widget sağlayıcısı Expo prebuild sırasında ana uygulama manifestine ekleniyor.
- 114 sure Türkçe adlarla gösteriliyor ve Türkçe adla aranabiliyor.
- Her ayetin yanında sesli dinleme ve duraklatma düğmesi var.
- Diyanet Türkçe meali korunuyor.
- EAS Project ID ve mevcut Expo proje sahibi yapılandırmaya eklendi.

## EAS Build

GitHub deposunda proje klasörü `rebuild` ise Expo Project GitHub Settings içindeki Base directory `/rebuild` olmalıdır.

Build from GitHub ayarları:

- Git ref: `main`
- Platform: Android
- EAS Build profile: `preview`
- Environment: Default
- Submit: kapalı

`preview` profili APK üretir.

## Doğrulama

```bash
npm install
npm run test:all
npx expo prebuild --platform android --clean --no-install
npx expo export --platform android
```

Ayrıntılar için `TEST-RESULTS.md` dosyasına bakın.
