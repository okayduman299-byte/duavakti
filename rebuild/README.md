# DuaVakti 1.2.0 FINAL

DuaVakti; namaz vakitleri, Kur’an okuma ve ayet bazında sesli tilavet, dualar ve Android ana ekran widgetları içeren Expo/React Native uygulamasıdır.

## Bu sürümde tamamlananlar

- 3 Android ana ekran widgetı: küçük, orta ve büyük.
- 114 surenin tamamı Türkçe adlarla gösterilir ve Türkçe adla aranabilir.
- Ayet bazında sesli tilavet ve duraklat/devam et akışı.
- Diyanet Türkçe meali.
- Son okunan sure ve çevrimdışı önbellek.
- Namaz vakitleri, sıradaki vakit ve geri sayım.
- Widget verisini uygulamadan native Android widgetlara aktaran Expo Module köprüsü.

## Kritik mimari düzeltme

Önceki sürümlerde widget Android modülü eski ve kırılgan bir Gradle yapılandırması kullanıyordu. 1.2.0 sürümünde modül, Expo SDK 57'nin güncel yerel modül yapısına geçirildi:

- `expo-module-gradle-plugin` kullanılır.
- `compileSdk`, `minSdk` ve `targetSdk` değerleri Expo'nun kendi module Gradle plugin'i tarafından yönetilir.
- Eski `ExpoModulesCorePlugin.gradle`, elle `safeExtGet(...)` ve kaynak kopyalayan özel config plugin kaldırıldı.
- Widget receiver kayıtları ve kaynakları doğrudan native modülün Android manifesti/res klasöründe tutulur.
- Yerel modül npm `file:` bağımlılığı değildir; Expo Autolinking tarafından `modules/` klasöründen bulunur.

## EAS Build ayarları

GitHub deposunda kaynak klasörü `rebuild` ise Expo Project GitHub Settings içindeki Base directory:

`/rebuild`

Build from GitHub:

- Git ref: `main`
- Platform: Android
- EAS Build profile: `preview`
- Environment: Default
- Submit: kapalı

`preview` profili APK üretir.

## Yerel doğrulama komutları

```bash
npm ci --include=dev
npm run test:all
npx expo prebuild --platform android --clean --no-install
npm run verify:prebuild
NODE_ENV=production npx expo export --platform android
```

Ayrıntılı sonuçlar için `TEST-RESULTS.md` dosyasına bakın.
