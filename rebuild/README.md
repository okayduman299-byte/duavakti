# DuaVakti 1.1.1

DuaVakti, namaz vakitleri, Kur’an okuma/dinleme, dualar ve Android ana ekran widgetları içeren Expo/React Native uygulamasıdır.

## 1.1 özellikleri

- Üç Android ana ekran widgetı: küçük, orta ve büyük.
- 114 sure Türkçe adlarla gösterilir ve Türkçe adla aranabilir.
- Her ayetin yanında sesli dinleme ve duraklatma düğmesi vardır.
- Diyanet Türkçe meali korunur.
- EAS Project ID ve mevcut Expo proje sahibi yapılandırmada hazırdır.

## 1.1.1 düzeltmesi

- EAS Build bağımlılık kurulumu için `package-lock.json` yalnızca genel npm kayıt adreslerini kullanır.
- 1.1.0 paketinde eksik kalan Android widget kaynakları pakete geri eklenmiştir.

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
npm ci --include=dev
npm run test:all
npx expo prebuild --platform android --clean --no-install
CI=1 npx expo export --platform android
```

Ayrıntılar için `TEST-RESULTS.md` dosyasına bakın.
