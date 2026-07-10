# DuaVakti 1.4.0 — Release Notes

Bu sürüm, gerçek cihazda bildirilen üç soruna odaklanır.

## Düzeltilenler

### Dualar bölümü
- Ekran tamamen sadeleştirildi.
- İç içe yatay ScrollView kaldırıldı.
- FlatList kullanılmıyor.
- Seçim yalnız dua kimliği (`selectedId`) üzerinden tutuluyor.
- Kategori filtreleri tek ScrollView içinde güvenli `View`/`Pressable` yapısına taşındı.

### Widgetlar
- Küçük widget artık sıradaki vakitle birlikte günün dua başlığını gösterir.
- Orta widget vakit, geri sayım, dua başlığı ve dua anlamını birlikte gösterir.
- Büyük widget beş vakit ile günün duasını aynı kartta gösterir.
- Ayrı “Günün Duası” widgetı korunmuştur.
- Eski yerleştirilmiş widgetlar uygulama açılıp “Tüm widgetları şimdi güncelle” denildiğinde yeni layout ile yenilenir.

### Canlı kıble pusulası
- Sabit derece göstergesi kaldırıldı.
- Cihaz pusulası canlı izlenir.
- Ok, telefon döndükçe Kâbe yönüne göre döner.
- 360° sınırında ters yönde sıçramayı azaltan açı yumuşatma eklendi.
- Pusula doğruluk durumu ve kalibrasyon uyarısı eklendi.

## Sürüm
- Uygulama: 1.4.0
- Android versionCode: 9
