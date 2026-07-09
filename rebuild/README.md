# DuaVakti 1.0.0 — sıfırdan yeniden yazım

Bu proje, önceki sürümün kodunu yamalamak yerine **tamamen sıfırdan** hazırlanmış Android odaklı DuaVakti uygulamasıdır.

Referans alınan ana deneyim: koyu arka plan, yeşil vakit kartı, günün kartı ve altta `Ana · Kur’an · Dualar · Widget · Ayarlar` gezinmesi.

## Bu sürümde neler var?

### Ana ekran

- Şehir veya GPS konumuna göre namaz vakitleri
- Türkiye için Diyanet hesaplama yöntemi (`method=13`)
- Sıradaki vakit ve canlı geri sayım
- Günün beş vakti
- Çevrimdışı son başarılı vakit önbelleği
- Günün ayet kartı

### Kur’an

- 114 sure listesi
- Sure arama
- Arapça ayet + Diyanet Türkçe meal
- Yazı boyutu küçültme / büyütme
- Arapça metni ayarlardan açıp kapatma
- Son okunan sureyi hatırlama
- Sure bazlı çevrimdışı önbellek
- Ağ, veri çözümleme ve depolama hatalarında kontrollü hata ekranı
- Tekrar deneme akışı
- Kök `ErrorBoundary`: beklenmeyen bir arayüz hatası olsa bile uygulamanın kapanmasını engeller

### Dualar

- Kur’an duaları
- Günlük dualar
- Zikir ve sığınma duaları
- Arapça, Latin harfli okunuş, anlam ve kaynak görünümü

### Android widget

Yerel Expo modülü ile üç ayrı Android ana ekran widgetı:

- Küçük: sıradaki vakit
- Orta: sıradaki vakit + kalan süre
- Büyük: günün beş vakti

Widgetlar uygulama vakit verisini aldığında otomatik eşitlenir. Ayrıca Widget ekranından elle güncellenebilir. Android, widget sağlayıcılarını en fazla sistemin izin verdiği sıklıkta yeniler; bu projede 30 dakikalık periyodik yenileme de tanımlıdır.

### Ayarlar

- Şehir değiştirme
- GPS konumu
- Arapça ayet görünürlüğü
- Kur’an yazı boyutu
- GPS koordinatı alınmışsa yaklaşık kıble açısı

## Mimari

```text
index.ts
  └─ App.tsx
      ├─ HomeScreen
      ├─ QuranScreen
      ├─ DuasScreen
      ├─ WidgetScreen
      └─ SettingsScreen

src/lib/
  ├─ prayerService.ts   -> AlAdhan API + günlük/konum bazlı cache
  ├─ quranService.ts    -> Al Quran Cloud API + sure bazlı cache
  ├─ prayer.ts          -> vakit temizleme, sıradaki vakit, kıble hesabı
  ├─ quran.ts           -> güvenli veri ayrıştırma ve arama
  ├─ storage.ts         -> çökmesiz AsyncStorage sarmalayıcısı
  └─ time.ts            -> tarih ve geri sayım yardımcıları

modules/duavakti-widget/
  └─ Android Expo local native module
      ├─ 3 AppWidgetProvider
      ├─ SharedPreferences veri köprüsü
      └─ 3 RemoteViews layout
```

## Kurulum

Gereksinimler:

- Node.js LTS
- Android Studio + Android SDK
- JDK

Komutlar:

```bash
npm install
npm run typecheck
npm test
```

Uygulamayı Android cihaz/emülatörde geliştirme sürümü olarak çalıştırmak için:

```bash
npx expo prebuild --platform android --clean
npx expo run:android --device
```

Bu projede özel Android widget kodu bulunduğu için gerçek widget testi **native development build veya APK** üzerinde yapılmalıdır. Expo Go içinde uygulamanın ana ekranları çalışabilir; özel native widget modülü bulunamazsa uygulama bunu hata vermeden atlar.

## APK üretme

Yerel Android ortamında:

```bash
npm install
npx expo prebuild --platform android --clean
npx expo run:android --variant release
```

EAS ile doğrudan APK:

```bash
npm install
npx eas-cli build -p android --profile preview
```

`eas.json` içindeki `preview` profili APK üretmek üzere hazırlanmıştır.

## Testler

Ayrıntılı sonuçlar `TEST-RESULTS.md` dosyasındadır.

Hızlı doğrulama:

```bash
npm run typecheck
npm run test:logic
npm run verify
```

## Veri kaynakları

- Namaz vakitleri: AlAdhan Prayer Times API
- Kur’an: Al Quran Cloud REST API
- Türkçe meal sürümü: `tr.diyanet`

Ağ servisleri ulaşılamazsa uygulama, daha önce başarıyla kaydedilmiş aynı gün/konum vakitlerini ve daha önce açılmış Kur’an içeriklerini önbellekten kullanır.

## Sürüm

`DuaVakti 1.0.0` — 9 Temmuz 2026
