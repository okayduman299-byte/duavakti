const fs = require('fs');
const path = require('path');
const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');

const ACTION = 'android.appwidget.action.APPWIDGET_UPDATE';
const PROVIDER_META = 'android.appwidget.provider';
const WIDGETS = [
  {
    name: 'com.shaesdoes.duavakti.widget.DuaVaktiSmallWidget',
    label: 'DuaVakti · Küçük',
    resource: '@xml/duavakti_widget_small_info',
  },
  {
    name: 'com.shaesdoes.duavakti.widget.DuaVaktiMediumWidget',
    label: 'DuaVakti · Orta',
    resource: '@xml/duavakti_widget_medium_info',
  },
  {
    name: 'com.shaesdoes.duavakti.widget.DuaVaktiLargeWidget',
    label: 'DuaVakti · Büyük',
    resource: '@xml/duavakti_widget_large_info',
  },
];

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`Widget kaynak klasörü bulunamadı: ${source}`);
  }
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) copyDirectory(from, to);
    else fs.copyFileSync(from, to);
  }
}

module.exports = function withDuaVaktiWidgets(config) {
  // The app manifest directly references @xml widget-provider resources. Android's
  // app resource linker must therefore see those resources in the app module.
  // Keep the native module resources for its Kotlin R class, and copy the same
  // resources into android/app/src/main/res during Expo prebuild.
  config = withDangerousMod(config, [
    'android',
    async (mod) => {
      const source = path.join(
        mod.modRequest.projectRoot,
        'modules',
        'duavakti-widget',
        'android',
        'src',
        'main',
        'res',
      );
      const target = path.join(
        mod.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
      );
      copyDirectory(source, target);
      return mod;
    },
  ]);

  return withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application?.[0];
    if (!application) throw new Error('Android application manifest bulunamadı.');
    application.receiver = application.receiver || [];

    for (const widget of WIDGETS) {
      const existingIndex = application.receiver.findIndex(
        (receiver) => receiver.$?.['android:name'] === widget.name,
      );
      const receiver = {
        $: {
          'android:name': widget.name,
          'android:enabled': 'true',
          'android:exported': 'true',
          'android:label': widget.label,
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': ACTION } }],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': PROVIDER_META,
              'android:resource': widget.resource,
            },
          },
        ],
      };
      if (existingIndex >= 0) application.receiver[existingIndex] = receiver;
      else application.receiver.push(receiver);
    }
    return mod;
  });
};
