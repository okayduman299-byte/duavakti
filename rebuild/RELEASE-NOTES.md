# DuaVakti 1.3.0 — Sürüm Notları

## Dualar

- İlk girişte görülen bölüm hata ekranını hedefleyen ekran mimarisi yenilendi.
- Dualar listesi ilk açılışta daha basit ve kararlı bir render akışı kullanıyor.
- Global hata sınırı yerine sekme bazlı hata sınırı kullanılıyor.

## Widget

- Yeni `DuaVakti · Günün Duası` widgetı eklendi.
- Native modül artık dua listesini SharedPreferences içinde saklıyor.
- Günün duası Android tarafında cihazın gün numarasına göre seçiliyor.
- Widgetda dua başlığı, Türkçe anlamı ve kaynağı gösteriliyor.
- Toplam widget receiver sayısı 4 oldu.

## Kur’an sesli tilavet

- `useAudioPlayer` tabanlı tek-ayetin-tek-sefer çalması kaldırıldı.
- `useAudioPlaylist` ve `useAudioPlaylistStatus` ile sure bazlı çalma listesi kullanılıyor.
- Ayetler otomatik olarak sıradaki ayete geçiyor.
- `Tümünü dinle`, `Duraklat`, `Devam et`, `Baştan dinle` akışları eklendi.
- Bir ayetten başlatıldığında kalan ayetler otomatik devam ediyor.
- Aktif ayet vurgulanıyor ve liste oynayan ayete kayıyor.

## Sürüm

- Uygulama: 1.3.0
- Android versionCode: 8
