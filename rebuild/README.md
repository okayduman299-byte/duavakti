# DuaVakti 1.5.0

DuaVakti; namaz vakitleri, Kur’an, dualar, Android ana ekran widgetları ve canlı kıble pusulası içeren Expo/React Native uygulamasıdır.

## Bu sürümde

- Namaz vakitleri için yerel bildirim uyarıları eklendi.
- Bildirim izni alındıktan sonra önümüzdeki 7 günün vakitleri planlanır.
- Ayarlar ekranına "Ezan vakti uyarıları" anahtarı eklendi.
- Kur’an ekranından Dualar sekmesine ilk geçişte oluşan ses oynatıcı kapanış yarışı giderildi.
- Kur’an ekranı kapandıktan sonra geç gelen ağ/önbellek sonuçlarının state güncellemesi engellendi.
- Widget dua içeriği günlük yerine saatlik değişir.
- Dört widgetın periyodik güncelleme aralığı 1 saat olarak ayarlandı.

## EAS Build

Expo projesinin GitHub Base directory ayarı `/rebuild` olmalıdır.

- Git ref: `main`
- Platform: `Android`
- EAS Build profile: `preview`
- Environment: `Default`

`preview` profili APK üretir.

## Doğrulama

Ayrıntılar için `TEST-RESULTS.md`, `RELEASE-NOTES.md` ve `VERIFICATION-LOG.txt` dosyalarına bakın.
