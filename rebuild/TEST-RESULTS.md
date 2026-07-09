# DuaVakti 1.1.0 Test Sonuçları

Tarih: 9 Temmuz 2026

## Sonuç özeti

- TypeScript tam tip kontrolü: PASS
- Mantık birim testleri: 16/16 PASS
- Statik uygulama ve widget doğrulaması: 32/32 PASS
- Expo Android prebuild: PASS
- Android JavaScript/Hermes export bundle: PASS
- Oluşturulan AndroidManifest.xml içinde 3 widget receiver kaydı: PASS
- Expo native autolinking içinde `duavakti-widget`: PASS
- Expo native autolinking içinde `expo-audio`: PASS

## Düzeltilen üç konu

### 1. Widget görünürlüğü

Eski sürümde widget receiver kayıtları yerel modül manifestine bağlıydı. 1.1.0 sürümünde küçük, orta ve büyük widget sağlayıcıları Expo config plugin ile doğrudan ana uygulamanın oluşturulan AndroidManifest.xml dosyasına ekleniyor.

Prebuild sonrası doğrulanan sınıflar:

- `com.shaesdoes.duavakti.widget.DuaVaktiSmallWidget`
- `com.shaesdoes.duavakti.widget.DuaVaktiMediumWidget`
- `com.shaesdoes.duavakti.widget.DuaVaktiLargeWidget`

Gerçek launcher widget seçicisinde görünürlük, yeni APK telefona kurulduktan sonra cihaz üzerinde doğrulanmalıdır.

### 2. Türkçe sure adları

114 surenin Türkçe adı yerel veri tablosuna eklendi. Sure listesi, okuyucu başlığı, son okunan kartı ve arama Türkçe adları kullanıyor.

### 3. Sesli okuma

Kur’an servisi artık Arapça metin + Diyanet meali + Mişârî Râşid el-Afâsî ses verisini birlikte alıyor. Her ayet kartına Dinle/Duraklat düğmesi eklendi.

## Çalıştırılan komutlar

```text
npm run test:all
npx expo prebuild --platform android --clean --no-install
npx expo export --platform android
npx expo-modules-autolinking resolve --platform android --json
```

## Sınırlama

Yerel Gradle release APK derlemesi denenmiştir; çalışma ortamı `services.gradle.org` adresine erişemediği için Gradle dağıtımı indirilememiştir. Bu nedenle son APK derlemesi EAS Build üzerinde yapılmalıdır.
