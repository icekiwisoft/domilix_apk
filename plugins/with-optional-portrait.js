const { withAndroidManifest } = require('expo/config-plugins');

const PORTRAIT_FEATURE = 'android.hardware.screen.portrait';

module.exports = function withOptionalPortrait(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const features = manifest['uses-feature'] ?? [];
    const portrait = features.find((feature) => feature.$['android:name'] === PORTRAIT_FEATURE);

    // Keep the preferred activity orientation without requiring portrait hardware in Google Play.
    if (portrait) {
      portrait.$['android:required'] = 'false';
    } else {
      features.push({ $: { 'android:name': PORTRAIT_FEATURE, 'android:required': 'false' } });
    }

    manifest['uses-feature'] = features;
    return config;
  });
};
