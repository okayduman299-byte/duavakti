# DuaVakti 1.1.3

Bu sürüm, EAS Prebuild sırasında widget kaynak klasörünün bulunamaması hatasını düzeltir.

## Düzeltilen hata

Önceki pakette `.gitignore` içindeki `android/` kuralı yalnız proje kökündeki Android klasörünü değil, `modules/duavakti-widget/android/` klasörünü de Git tarafından yok sayıyordu. GitHub Actions ZIP'i doğru açsa bile widget'ın Kotlin ve Android kaynak dosyaları commit'e girmiyordu. EAS bu nedenle:

`Widget kaynak klasörü bulunamadı: modules/duavakti-widget/android/src/main/res`

hatasıyla prebuild aşamasında duruyordu.

## 1.1.3 düzeltmesi

- `.gitignore` kuralı `android/` yerine `/android/` yapıldı.
- Böylece yalnız Expo'nun kökte ürettiği native Android klasörü ignore edilir.
- `modules/duavakti-widget/android/` artık GitHub commit'ine dahil edilir.
- Uygulama sürümü 1.1.3, Android versionCode 5 olarak güncellendi.
