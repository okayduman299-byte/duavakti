const { withAndroidManifest } = require('expo/config-plugins');

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

module.exports = function withDuaVaktiWidgets(config) {
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
