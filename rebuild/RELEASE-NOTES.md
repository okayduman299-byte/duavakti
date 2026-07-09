# DuaVakti 1.1.1

## Derleme ve widget paket düzeltmesi

- 1.1.0 paketindeki `package-lock.json` dosyasında geliştirme ortamına özel npm kayıt adresleri bulunduğu için EAS `npm ci` aşamasında duruyordu. Tüm kilit dosyası adresleri genel npm kayıt adreslerine taşındı.
- 1.1.0 ZIP paketine yanlışlıkla girmeyen Android widget kaynakları geri eklendi.
- Küçük, orta ve büyük widget sınıfları, düzenleri ve provider XML dosyaları pakette tekrar mevcut.
- Paket temiz `npm ci --include=dev`, tam TypeScript kontrolü, 16 mantık testi, statik widget doğrulaması, Expo Android prebuild ve Android export ile yeniden doğrulandı.

## 1.1 özellikleri

- Widget: küçük, orta ve büyük Android ana ekran widgetları.
- Kur’an: 114 Türkçe sure adı ve Türkçe adlarla arama.
- Ses: ayet bazında Dinle/Duraklat.

## Sürüm

- Uygulama: 1.1.1
- Android versionCode: 3
