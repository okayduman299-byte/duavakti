# DuaVakti 1.3.0

DuaVakti; namaz vakitleri, Kur’an-ı Kerim, Türkçe sure adları, Diyanet meali, kesintisiz sesli tilavet, dualar ve Android ana ekran widgetları içeren Expo/React Native uygulamasıdır.

## Bu sürümde düzeltilen 3 konu

### 1. Dualar ekranı ilk açılış hatası

- Dualar ekranının ilk açılış yolu sadeleştirildi.
- İlk yüklemede `FlatList` tabanlı yaşam döngüsü kaldırıldı ve güvenli `ScrollView` akışına geçirildi.
- Hata sınırı artık sekme bazlı çalışır; bir bölümde hata olsa bile alt menü ve diğer bölümler kapanmaz.
- Sekme değiştiğinde hata durumu temiz bir bileşenle yeniden başlar.

### 2. Dua widgetı

Uygulamada artık 4 Android widget bulunur:

1. Küçük — sıradaki namaz vakti
2. Orta — sıradaki vakit ve geri sayım
3. Büyük — bugünün namaz vakitleri
4. Günün Duası — her gün değişen dua, anlam ve kaynak

Dua listesi native Android widget katmanına aktarılır. Widget, günün duasını cihazın gün bilgisine göre seçer ve uygulama açık değilken de widget güncellemelerinde aynı veriyi kullanır.

### 3. Kur’an kesintisiz sesli okuma

- Tek tek ayet oynatıcı yerine gerçek ses çalma listesi kullanılır.
- `Tümünü dinle` düğmesi sureyi baştan sona otomatik ilerletir.
- Bir ayetten `Buradan dinle` denirse o ayetten başlayıp sonraki ayetlere otomatik devam eder.
- Oynayan ayet vurgulanır ve liste aktif ayete doğru kayar.
- Duraklat, devam et ve bittikten sonra baştan dinle akışları vardır.

## EAS Build

GitHub deposunda kaynak klasörü `rebuild` ise Expo Project GitHub Settings içindeki Base directory:

`/rebuild`

Build from GitHub:

- Git ref: `main`
- Platform: Android
- EAS Build profile: `preview`
- Environment: Default
- Submit: kapalı

`preview` profili APK üretir.

## Yerel doğrulama

```bash
npm ci --include=dev
npm run typecheck
npm run test:logic
npm run verify
npx expo prebuild --platform android --clean
npm run verify:prebuild
npm run export:android
```

Ayrıntılı sonuçlar için `TEST-RESULTS.md` dosyasına bakın.
