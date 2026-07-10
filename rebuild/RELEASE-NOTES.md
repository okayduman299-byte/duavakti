# DuaVakti 1.4.2

## Ana düzeltme

Kur'an sure detayına girince görülen bölüm hatası için ses motoru değiştirildi.

1.3.0 ile eklenen `AudioPlaylist` tabanlı yapı tamamen kaldırıldı. 1.2.0'da çalışan tek `AudioPlayer` yapısına dönüldü ve otomatik sonraki ayete geçiş bu oyuncu üzerinde yeniden kuruldu.

- Sure listesi ve sure detay ekranı ses motorundan bağımsız açılır.
- Bir ayetten dinleme başlatınca sonraki ayetlere otomatik devam eder.
- `Tümünü dinle` sureyi ilk ayetten son ayete kadar sırayla oynatır.
- Duraklat/devam et korunur.
- Ayet bittiğinde yalnız bir kez sonraki ayete geçmek için bitiş kenarı korunur; aynı bitiş olayı birden fazla ayeti atlayamaz.
- Sekme hata sınırı teknik hata metnini boş bırakmayacak şekilde güçlendirildi.

## Korunan özellikler

- Canlı kıble pusulası
- Küçük/orta/büyük namaz widgetları
- Günün duası widgetı
- Türkçe sure isimleri ve Diyanet meali
- Dua listesi ve dua detayları
