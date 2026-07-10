import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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

check(fs.existsSync(path.join(root, 'android')), 'Expo prebuild Android projesi üretti');

const result = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['expo-modules-autolinking', 'resolve', '--platform', 'android'],
  { cwd: root, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' } },
);
check(result.status === 0, 'Expo autolinking çözümlemesi çalıştı', result.stderr || `exit ${result.status}`);
const output = `${result.stdout}\n${result.stderr}`.replace(/\u001b\[[0-9;]*m/g, '');
check(output.includes("packageName: 'duavakti-widget'"), 'Yerel widget paketi autolinking tarafından bulundu');
check(output.includes('modules/duavakti-widget/android'), 'Autolinking doğru widget Android klasörünü kullanıyor');
check(output.includes('com.shaesdoes.duavakti.widget.DuaVaktiWidgetModule'), 'Native widget modülü autolinking listesinde');

const appGradle = read('android/app/build.gradle');
check(appGradle.includes('compileSdk rootProject.ext.compileSdkVersion'), 'Ana uygulama compileSdk değerini Expo kök projesinden alıyor');

const moduleGradle = read('modules/duavakti-widget/android/build.gradle');
check(moduleGradle.includes("id 'expo-module-gradle-plugin'"), 'Yerel modül resmi Expo module Gradle plugin kullanıyor');

const pluginSource = read('node_modules/expo-modules-core/expo-module-gradle-plugin/src/main/kotlin/expo/modules/plugin/ProjectConfiguration.kt');
check(pluginSource.includes('applyDefaultAndroidSdkVersions'), 'Kurulu Expo module plugin SDK varsayılanlarını uyguluyor');
check(pluginSource.includes('compileSdkVersion", 36'), 'Kurulu Expo module plugin compileSdk 36 geri dönüşüne sahip');

const androidManifest = read('modules/duavakti-widget/android/src/main/AndroidManifest.xml');
const receiverCount = (androidManifest.match(/<receiver\b/g) ?? []).length;
check(receiverCount === 4, 'Widget modül manifestinde tam 4 receiver var', `bulunan: ${receiverCount}`);

for (const rel of [
  'modules/duavakti-widget/android/src/main/res/xml/duavakti_widget_small_info.xml',
  'modules/duavakti-widget/android/src/main/res/xml/duavakti_widget_medium_info.xml',
  'modules/duavakti-widget/android/src/main/res/xml/duavakti_widget_large_info.xml',
  'modules/duavakti-widget/android/src/main/res/xml/duavakti_widget_dua_info.xml',
]) {
  check(fs.existsSync(path.join(root, rel)), `${path.basename(rel)} mevcut`);
}

console.log(`PASS ${passes.length}`);
for (const label of passes) console.log(`  ✓ ${label}`);
if (failures.length) {
  console.error(`FAIL ${failures.length}`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}
console.log('PREBUILD VERIFICATION: PASS');
