# DuaVakti 1.1.1 Test Sonuçları

Tarih: 10 Temmuz 2026

## Sonuç özeti

- Temiz bağımlılık kurulumu (`npm ci --include=dev`): PASS — 480 paket
- TypeScript tam tip kontrolü: PASS
- Mantık birim testleri: 16/16 PASS
- Statik uygulama ve widget doğrulaması: 32/32 PASS
- Expo Android prebuild: PASS
- Android JavaScript/Hermes export bundle: PASS — 622 modül
- Oluşturulan AndroidManifest.xml içinde 3 widget receiver kaydı: PASS
- Expo native autolinking içinde `duavakti-widget`: PASS
- Expo native autolinking içinde `expo-audio`: PASS
- Kilit dosyasında özel geliştirme ortamı npm adresi: 0 adet
- Kilit dosyasında genel npm kayıt adresi: 400’den fazla paket girdisi

## Düzeltilen EAS Build hatası

1.1.0 paketindeki `package-lock.json`, geliştirme sırasında kullanılan özel npm kayıt adreslerini içeriyordu. EAS Build bu adreslere erişemediği için bağımlılık kurulumu `npm ci --include=dev` aşamasında `Exit handler never called!` hatasıyla durdu.

1.1.1 sürümünde:

- tüm registry paket URL’leri `https://registry.npmjs.org` alanına taşındı;
- aynı kilit dosyasıyla temiz `npm ci --include=dev` kurulumu yeniden çalıştırıldı ve geçti;
- 1.1.0 ZIP paketinde yanlışlıkla eksik kalan Android widget kaynakları v1.0 kaynaklarından geri eklendi ve tekrar doğrulandı.

## Özellik doğrulamaları

### Widget

Doğrulanan sınıflar:

- `com.shaesdoes.duavakti.widget.DuaVaktiSmallWidget`
- `com.shaesdoes.duavakti.widget.DuaVaktiMediumWidget`
- `com.shaesdoes.duavakti.widget.DuaVaktiLargeWidget`

Kaynak pakette Kotlin sınıfları, üç layout XML’i ve üç provider XML’i mevcuttur. Prebuild sonrası ana uygulama manifestinde üç receiver kaydı da doğrulandı.

### Türkçe sure adları

114 surenin Türkçe adı yerel veri tablosunda bulunuyor. Sure listesi, okuyucu başlığı, son okunan kartı ve arama Türkçe adları kullanıyor.

### Sesli okuma

Kur’an servisi Arapça metin, Diyanet meali ve Mişârî Râşid el-Afâsî ses verisini birlikte alıyor. Ayet kartlarında Dinle/Duraklat akışı statik olarak ve TypeScript ile doğrulandı.

## Çalıştırılan komutlar

```text
npm ci --include=dev --no-audit --no-fund
npm run test:all
npx expo prebuild --platform android --clean --no-install
CI=1 npx expo export --platform android
npx expo-modules-autolinking resolve --platform android --json
```

## Sınırlama

Son Android APK derlemesi bu ortamda değil, EAS Build üzerinde yapılmalıdır. Gerçek launcher’da widget görünürlüğü ve gerçek cihazda ses oynatma, yeni APK kurulduktan sonra cihaz üzerinde son kez doğrulanacaktır.
