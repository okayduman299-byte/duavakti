# DuaVakti 1.2.0 FINAL

## Neden yeni bir final sürüm hazırlandı?

Önceki EAS denemelerinde widget tarafında art arda üç ayrı native build sorunu görüldü:

1. App manifestinin referans verdiği widget XML kaynakları bulunamadı.
2. Widget kaynak klasörü GitHub commit'ine girmedi.
3. Yerel widget modülü `compileSdk` yapılandırmasını doğru şekilde alamadı.

Bu sorunları tek tek yama yapmak yerine widget mimarisi baştan sadeleştirildi.

## Temel düzeltme

Widget modülü artık Expo SDK 57'nin güncel yerel Expo Module şablonunu kullanır:

- Android Gradle plugin: `expo-module-gradle-plugin`
- Expo Autolinking: `modules/duavakti-widget`
- Receiver kayıtları: modül `AndroidManifest.xml`
- Widget layout/provider kaynakları: modül `android/src/main/res`
- Eski kaynak kopyalama config plugin'i: kaldırıldı
- Eski `ExpoModulesCorePlugin.gradle` yaklaşımı: kaldırıldı
- Elle `compileSdkVersion safeExtGet(...)`: kaldırıldı

Bu değişiklik, EAS logunda görülen `project ':duavakti-widget' does not specify compileSdk` hatasının kök sebebini ortadan kaldırır.

## Kur’an tarafı

- 114 Türkçe sure adı korunur.
- Türkçe adlarla arama yapılır.
- Diyanet Türkçe meal korunur.
- `ar.alafasy` sesli tilavet akışı korunur.
- `expo-audio` için gereken `expo-asset` doğrudan bağımlılık olarak eklendi.

## Sürüm

- Uygulama: 1.2.0
- Android versionCode: 7
