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

const required = [
  'index.ts',
  'App.tsx',
  'src/screens/HomeScreen.tsx',
  'src/screens/QuranScreen.tsx',
  'src/screens/DuasScreen.tsx',
  'src/screens/WidgetScreen.tsx',
  'src/screens/SettingsScreen.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/lib/prayerService.ts',
  'src/lib/quranService.ts',
  'modules/duavakti-widget/android/src/main/AndroidManifest.xml',
  'modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_small.xml',
  'modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_medium.xml',
  'modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_large.xml',
];
check(required.every((file) => fs.existsSync(path.join(root, file))), 'Gerekli kaynak dosyaları mevcut');

const app = read('App.tsx');
check(app.includes('<ErrorBoundary>'), 'Kök hata sınırı etkin');
for (const screen of ['HomeScreen', 'QuranScreen', 'DuasScreen', 'WidgetScreen', 'SettingsScreen']) {
  check(app.includes(screen), `${screen} uygulamaya bağlı`);
}

const quran = read('src/screens/QuranScreen.tsx');
check(quran.includes('try {') && quran.includes('catch (err)'), 'Kur’an ağ/yükleme hataları yakalanıyor');
check(quran.includes('ErrorState') && quran.includes('onRetry'), 'Kur’an tekrar deneme akışı var');
check(quran.includes('LAST_READ_KEY') && quran.includes('writeJson'), 'Son okunan sure saklanıyor');
check(quran.includes('readerLoading') && quran.includes('listLoading'), 'Liste ve okuyucu yükleme durumları ayrık');

const quranService = read('src/lib/quranService.ts');
check(quranService.includes('api.alquran.cloud/v1/surah'), 'Kur’an servis uç noktası tanımlı');
check(quranService.includes("tr.diyanet"), 'Diyanet Türkçe meal sürümü tanımlı');
check(quranService.includes("source: 'cache'"), 'Kur’an çevrimdışı önbellek dönüşü var');

const prayerService = read('src/lib/prayerService.ts');
check(prayerService.includes('api.aladhan.com/v1/timings'), 'Namaz vakti servis uç noktası tanımlı');
check(prayerService.includes('method=13'), 'Diyanet hesaplama yöntemi seçili');
check(prayerService.includes("source: 'cache'"), 'Namaz vakti çevrimdışı önbellek dönüşü var');

const manifest = read('modules/duavakti-widget/android/src/main/AndroidManifest.xml');
for (const name of ['DuaVaktiSmallWidget', 'DuaVaktiMediumWidget', 'DuaVaktiLargeWidget']) {
  check(manifest.includes(name), `${name} Android manifestine kayıtlı`);
}

const allowedLayouts = new Set(['LinearLayout', 'TextView']);
for (const size of ['small', 'medium', 'large']) {
  const rel = `modules/duavakti-widget/android/src/main/res/layout/duavakti_widget_${size}.xml`;
  const xml = read(rel);
  const tags = [...xml.matchAll(/<\/?([A-Za-z][A-Za-z0-9_.]*)\b/g)]
    .map((match) => match[1].split('.').at(-1))
    .filter(Boolean);
  const illegal = [...new Set(tags.filter((tag) => !allowedLayouts.has(tag)))];
  check(illegal.length === 0, `Widget ${size} yalnız destekli RemoteViews sınıflarını kullanıyor`, illegal.join(', '));
  check(xml.includes('@+id/widget_root'), `Widget ${size} kök tıklama ID'sine sahip`);
}

const infoFiles = ['small', 'medium', 'large'].map((size) => `modules/duavakti-widget/android/src/main/res/xml/duavakti_widget_${size}_info.xml`);
check(infoFiles.every((file) => read(file).includes('resizeMode="none"')), 'Widget boyutları sabit ve güvenli');

const sourceFiles = [];
function collect(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.test-build'].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) collect(full);
    else if (/\.(ts|tsx|js|mjs|kt|xml)$/.test(item.name)) sourceFiles.push(full);
  }
}
collect(root);
const markerPattern = new RegExp('\\b(' + ['TO', 'DO'].join('') + '|' + ['FIX', 'ME'].join('') + ')\\b');
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
