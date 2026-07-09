# DuaVakti 1.0.0 — Release Notes

## Tam yeniden yazım

Önceki uygulamanın kaynak kodu kullanılmadı. Uygulama sıfırdan kuruldu.

## Kur’an çökme sorununa karşı yapılan temel değişiklikler

- Kur’an sekmesi bağımsız yükleme ve okuyucu durumlarına ayrıldı.
- API cevabı doğrudan ekrana basılmıyor; önce güvenli parser'dan geçiyor.
- Bozuk veya eksik satırlar uygulamayı kapatmak yerine atlanıyor.
- Ağ ve parser hataları ekranda gösteriliyor.
- Tekrar deneme düğmesi var.
- Sure listesi ve her sure ayrı ayrı cache'leniyor.
- Son okunan sure saklanıyor.
- Beklenmeyen React hataları için kök ErrorBoundary var.

## Yeni özellikler

- Canlı sıradaki vakit geri sayımı
- Şehir ve GPS modu
- Çevrimdışı vakit cache'i
- 114 sure listesi ve arama
- Diyanet Türkçe meal
- Ayet yazı boyutu
- Arapça göster/gizle
- Dua kütüphanesi
- Kıble açısı
- Küçük/orta/büyük Android widget
- Uygulama açıldığında otomatik widget eşitleme

## Durum

Kaynak sürüm: **hazır**

Offline test paketi: **PASS**

Native Android/APK ve gerçek cihaz testi: **bu çalışma ortamında Android SDK ve npm ağı olmadığı için henüz çalıştırılmadı**
