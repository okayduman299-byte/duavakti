# DuaVakti 1.1.2 — Sürüm Notları

Tarih: 10 Temmuz 2026

## Düzeltilen EAS Build hatası

1.1.1 sürümündeki EAS Android build'i `:app:processReleaseResources` aşamasında duruyordu. Gradle/AAPT hatası, ana uygulama manifestinin şu kaynakları bulamadığını gösterdi:

- `@xml/duavakti_widget_small_info`
- `@xml/duavakti_widget_medium_info`
- `@xml/duavakti_widget_large_info`

Kök neden: Widget provider XML dosyaları yerel Expo modülünün Android resource klasöründe bulunuyordu, ancak config plugin receiver kayıtlarını doğrudan ana uygulama manifestine ekliyordu. AAPT, bu manifest referanslarını ana uygulama modülünün resource alanında çözemedi.

## 1.1.2 düzeltmesi

`withDuaVaktiWidgets` config plugin'i artık Expo prebuild sırasında widget Android kaynaklarını şu hedefe de kopyalar:

`android/app/src/main/res`

Kopyalanan kaynaklar:

- üç provider XML dosyası;
- üç widget layout XML dosyası;
- widget arka plan drawable dosyası;
- widget açıklama string kaynakları.

Yerel modüldeki kaynaklar korunur. Böylece Kotlin widget sınıfları kendi `R` sınıfıyla derlenmeye devam ederken ana uygulama manifestindeki `@xml/...` referansları da AAPT tarafından bulunabilir.

Ayrıca widget string kaynakları `duavakti_widget_strings.xml` dosyasına ayrıldı; böylece ana uygulamanın `strings.xml` dosyası ezilmez.

## Sürüm bilgisi

- Uygulama sürümü: 1.1.2
- Android versionCode: 4

## Korunan özellikler

- Türkçe 114 sure adı
- Diyanet Türkçe meal
- Ayet bazlı sesli dinleme / duraklatma
- Küçük, orta ve büyük Android ana ekran widgetları
