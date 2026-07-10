import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const passes = [];

function check(condition, label, detail = '') {
  if (condition) passes.push(label);
  else failures.push(detail ? `${label}: ${detail}` : label);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

const required = [
  'index.ts',
  'App.tsx',
  'src/screens/HomeScreen.tsx',
  'src/screens/QuranScreen.tsx',
  'src/screens/DuasScreen.tsx',
  'src/screens/WidgetScreen.tsx',
  'src/screens/SettingsScreen.tsx',
  'src/components/QiblaCompass.tsx',
  'src/lib/qibla.ts',
  'src/data/surahNames.ts',
  'src/components/ErrorBoundary.tsx',
  'src/lib/prayerService.ts',
  'src/lib/quranService.ts',
  'modules/duavakti-widget/expo-module.config.json',
  'modules/duavakti-widget/android/build.gradle',
  'modules/duavakti-widget/android/src/main/AndroidManifest.xml',
  'modules/duavakti-widget/android/src/main/java/com/shaesdoes/duavakti/widget/DuaVaktiWidgetModule.kt',
  'modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_small.xml',
  'modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_medium.xml',
  'modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_large.xml',
  'modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_dua.xml',
  'modules/duavakti-widget/android/src/main/res/xml/duavakti_widget_small_info.xml',
  'modules/duavakti-widget/android/src/main/res/xml/duavakti_widget_medium_info.xml',
  'modules/duavakti-widget/android/src/main/res/xml/duavakti_widget_large_info.xml',
  'modules/duavakti-widget/android/src/main/res/xml/duavakti_widget_dua_info.xml',
];
check(required.every(exists), 'Gerekli kaynak dosyaları mevcut');

const pkg = JSON.parse(read('package.json'));
check(pkg.version === '1.4.0', 'Paket sürümü 1.4.0');
check(!('duavakti-widget' in (pkg.dependencies ?? {})), 'Yerel widget modülü npm file bağımlılığı değil');
check(!('expo-dev-client' in (pkg.dependencies ?? {})), 'Preview APK gereksiz dev-client bağımlılığı taşımıyor');
check(pkg.dependencies?.['expo-asset'] === '~57.0.3', 'expo-audio için gerekli expo-asset doğrudan kurulu');

const lock = read('package-lock.json');
check(!/internal\.api\.openai\.org|applied-caas|artifactory\/api\/npm/i.test(lock), 'package-lock yalnız genel npm adreslerini kullanıyor');

const appConfig = JSON.parse(read('app.json'));
check(appConfig.expo?.version === '1.4.0', 'Expo uygulama sürümü 1.4.0');
check(appConfig.expo?.android?.versionCode === 9, 'Android versionCode 9');
const plugins = appConfig.expo?.plugins ?? [];
check(!plugins.some((entry) => entry === './plugins/withDuaVaktiWidgets'), 'Kırılgan widget config plugin kaldırıldı');
check(plugins.some((entry) => Array.isArray(entry) && entry[0] === 'expo-audio'), 'expo-audio config plugin bağlı');

const app = read('App.tsx');
check(app.includes('resetKey={tab}') && app.includes('<ErrorBoundary key={tab}'), 'Sekme bazlı hata sınırı etkin');
for (const screen of ['HomeScreen', 'QuranScreen', 'DuasScreen', 'WidgetScreen', 'SettingsScreen']) {
  check(app.includes(screen), `${screen} uygulamaya bağlı`);
}

const quran = read('src/screens/QuranScreen.tsx');
check(quran.includes('try {') && quran.includes('catch (err)'), 'Kur’an ağ/yükleme hataları yakalanıyor');
check(quran.includes('ErrorState') && quran.includes('onRetry'), 'Kur’an tekrar deneme akışı var');
check(quran.includes('LAST_READ_KEY') && quran.includes('writeJson'), 'Son okunan sure saklanıyor');
check(quran.includes('readerLoading') && quran.includes('listLoading'), 'Liste ve okuyucu yükleme durumları ayrık');
check(quran.includes('useAudioPlaylist') && quran.includes('useAudioPlaylistStatus'), 'Kur’an kesintisiz ses çalma listesi bağlı');
check(quran.includes('Tümünü dinle') && quran.includes('playlist.skipTo'), 'Sureyi baştan sona otomatik dinleme akışı var');
check(quran.includes('turkishName'), 'Kur’an ekranında Türkçe sure adları kullanılıyor');

const surahNames = read('src/data/surahNames.ts');
const quotedNames = [...surahNames.matchAll(/'([^']+)'/g)].map((m) => m[1]);
check(quotedNames.length >= 114, '114 Türkçe sure adı kaynakta mevcut', `bulunan: ${quotedNames.length}`);

const quranService = read('src/lib/quranService.ts');
check(quranService.includes('api.alquran.cloud/v1/surah'), 'Kur’an servis uç noktası tanımlı');
check(quranService.includes('tr.diyanet'), 'Diyanet Türkçe meal sürümü tanımlı');
check(quranService.includes('ar.alafasy'), 'Mişârî el-Afâsî sesli tilavet sürümü tanımlı');
check(quranService.includes("source: 'cache'"), 'Kur’an çevrimdışı önbellek dönüşü var');

const prayerService = read('src/lib/prayerService.ts');
check(prayerService.includes('api.aladhan.com/v1/timings'), 'Namaz vakti servis uç noktası tanımlı');
check(prayerService.includes('method=13'), 'Diyanet hesaplama yöntemi seçili');
check(prayerService.includes("source: 'cache'"), 'Namaz vakti çevrimdışı önbellek dönüşü var');

const moduleGradle = read('modules/duavakti-widget/android/build.gradle');
check(moduleGradle.includes("id 'expo-module-gradle-plugin'"), 'Widget modülü SDK 57 Expo module Gradle plugin kullanıyor');
check(!moduleGradle.includes('ExpoModulesCorePlugin.gradle'), 'Eski ExpoModulesCorePlugin.gradle yaklaşımı kaldırıldı');
check(!moduleGradle.includes('safeExtGet("compileSdkVersion"'), 'Widget modülü compileSdk değerini elle yönetmiyor');
check(moduleGradle.includes('namespace "com.shaesdoes.duavakti.widget"'), 'Widget Android namespace tanımlı');

const moduleConfig = JSON.parse(read('modules/duavakti-widget/expo-module.config.json'));
check(moduleConfig.android?.modules?.includes('com.shaesdoes.duavakti.widget.DuaVaktiWidgetModule'), 'Widget Expo modülü autolinking yapılandırmasında');

const manifest = read('modules/duavakti-widget/android/src/main/AndroidManifest.xml');
for (const name of ['DuaVaktiSmallWidget', 'DuaVaktiMediumWidget', 'DuaVaktiLargeWidget', 'DuaVaktiDuaWidget']) {
  check(manifest.includes(`com.shaesdoes.duavakti.widget.${name}`), `${name} modül manifestinde kayıtlı`);
}
for (const resource of ['duavakti_widget_small_info', 'duavakti_widget_medium_info', 'duavakti_widget_large_info', 'duavakti_widget_dua_info']) {
  check(manifest.includes(`@xml/${resource}`), `${resource} widget metadata kaynağı bağlı`);
}

const allowedLayouts = new Set(['LinearLayout', 'TextView']);
for (const size of ['small', 'medium', 'large', 'dua']) {
  const rel = `modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_${size}.xml`;
  const xml = read(rel);
  const tags = [...xml.matchAll(/<\/?([A-Za-z][A-Za-z0-9_.]*)\b/g)]
    .map((match) => match[1].split('.').at(-1))
    .filter(Boolean);
  const illegal = [...new Set(tags.filter((tag) => !allowedLayouts.has(tag)))];
  check(illegal.length === 0, `Widget ${size} yalnız destekli RemoteViews sınıflarını kullanıyor`, illegal.join(', '));
  check(xml.includes('@+id/widget_root'), `Widget ${size} kök tıklama ID'sine sahip`);
}

const infoFiles = ['small', 'medium', 'large', 'dua'].map((size) => `modules/duavakti-widget/android/src/main/res/xml/duavakti_widget_${size}_info.xml`);
check(infoFiles.every((file) => read(file).includes('android:widgetCategory="home_screen"')), 'Dört widget da home_screen kategorisinde');
check(infoFiles.every((file) => read(file).includes('android:initialLayout=')), 'Dört widget provider dosyasında initialLayout var');

const nativeModule = read('modules/duavakti-widget/android/src/main/java/com/shaesdoes/duavakti/widget/DuaVaktiWidgetModule.kt');
check(nativeModule.includes('Name("DuaVaktiWidget")'), 'Native widget köprüsü doğru modül adıyla kayıtlı');
check(nativeModule.includes('updateAllWidgets(context)'), 'Widget güncelleme çağrısı native köprüde bağlı');
check(nativeModule.includes('putString("duas"'), 'Dua listesi native widget verisine kaydediliyor');
const duaWidget = read('modules/duavakti-widget/android/src/main/java/com/shaesdoes/duavakti/widget/DuaVaktiDuaWidget.kt');
check(duaWidget.includes('data.dailyDua'), 'Günün duası widgetı günlük dua verisini gösteriyor');
for (const size of ['Small', 'Medium', 'Large']) {
  const provider = read(`modules/duavakti-widget/android/src/main/java/com/shaesdoes/duavakti/widget/DuaVakti${size}Widget.kt`);
  check(provider.includes('data.dailyDua'), `${size} widget günlük dua verisini de gösteriyor`);
}
for (const size of ['small', 'medium', 'large']) {
  const layout = read(`modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_${size}.xml`);
  check(layout.includes('@+id/dua_title'), `Widget ${size} dua başlığı alanına sahip`);
}
const mediumLayout = read('modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_medium.xml');
const largeLayout = read('modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_large.xml');
check(mediumLayout.includes('@+id/dua_meaning'), 'Orta widget dua anlamını gösteriyor');
check(largeLayout.includes('@+id/dua_meaning'), 'Büyük widget dua anlamını gösteriyor');
const duasScreen = read('src/screens/DuasScreen.tsx');
check(!duasScreen.includes('FlatList'), 'Dualar ekranı ilk açılışta FlatList yaşam döngüsüne bağlı değil');
check(!duasScreen.includes('horizontal'), 'Dualar ekranında iç içe yatay ScrollView yok');
check(duasScreen.includes('selectedId') && duasScreen.includes('category'), 'Dualar ekranı sade kimlik ve kategori durumuyla çalışıyor');

const qiblaCompass = read('src/components/QiblaCompass.tsx');
check(qiblaCompass.includes('Location.watchHeadingAsync'), 'Kıble pusulası cihaz yönünü canlı izliyor');
check(qiblaCompass.includes('relativeQiblaAngle'), 'Kıble oku telefon yönüne göre hesaplanıyor');
check(qiblaCompass.includes('subscription?.remove()'), 'Kıble pusulası aboneliği ekran kapanınca temizleniyor');
const settingsScreen = read('src/screens/SettingsScreen.tsx');
check(settingsScreen.includes('<QiblaCompass'), 'Canlı kıble pusulası ayarlar ekranına bağlı');

const sourceFiles = [];
function collect(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.test-build', 'android', 'ios'].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) collect(full);
    else if (/\.(ts|tsx|js|mjs|kt|xml|gradle)$/.test(item.name)) sourceFiles.push(full);
  }
}
collect(root);
const markerPattern = /\b(TODO|FIXME)\b/;
const markerHits = sourceFiles.filter((file) => path.resolve(file) !== path.resolve(root, 'scripts/verify.mjs') && markerPattern.test(fs.readFileSync(file, 'utf8')));
check(markerHits.length === 0, 'Kaynakta TODO/FIXME kalmadı', markerHits.map((x) => path.relative(root, x)).join(', '));

console.log(`PASS ${passes.length}`);
for (const label of passes) console.log(`  ✓ ${label}`);
if (failures.length) {
  console.error(`FAIL ${failures.length}`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}
console.log('STATIC VERIFICATION: PASS');
