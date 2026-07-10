# DuaVakti 1.5.0 — Sürüm Notları

## 1. Ezan vakti uyarıları

- `expo-notifications` eklendi.
- Android için `prayer-times` bildirim kanalı oluşturulur.
- İlk kullanımda bildirim izni istenir.
- Mevcut konum/şehir ayarına göre önümüzdeki 7 günün namaz vakitleri tek seferlik yerel bildirimler olarak planlanır.
- Uygulama yeniden açıldığında veya konum/vakit kaynağı değiştiğinde eski DuaVakti ezan planları temizlenip yeniden oluşturulur.
- Gelecek günlerden biri geçici olarak alınamazsa diğer günlerin planı yine oluşturulur.
- Ayarlar ekranına "Ezan vakti uyarıları" anahtarı eklendi. Kapatıldığında yalnız DuaVakti'nin ezan bildirimleri iptal edilir.

## 2. Kur’an → Dualar geçiş kararlılığı

- `useAudioPlayer` zaten bileşen yaşam döngüsünde otomatik serbest bırakıldığı için unmount sırasında yapılan elle `player.pause()` kaldırıldı.
- Ses modu kurulumu hata verse bile ekran geçişini düşürmemesi için güvenli hale getirildi.
- Kur’an ekranı kapandıktan sonra tamamlanan sure listesi/sure detay isteklerinin state güncellemesi yapması engellendi.
- Otomatik ayet okuma davranışı korunmuştur.

## 3. Widgetlar saatlik değişiyor

- Dua seçimi `DAY_OF_YEAR + HOUR_OF_DAY` tabanlı saatlik dilime taşındı.
- Dört widgetın `updatePeriodMillis` değeri `3600000` (1 saat) oldu.
- Küçük/orta/büyük widgetlarda başlık "SAATİN DUASI" olarak güncellendi.
- Saat değişince aynı gün içinde farklı dua gösterilir.

## Sürüm

- Uygulama: `1.5.0`
- Android `versionCode`: `12`
- Expo SDK: `57`
