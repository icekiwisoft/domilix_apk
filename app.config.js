// Extends app.json with values that come from the environment (EAS secrets /
// local .env) so no key is committed. Every block is skipped when its variable
// is missing, so local builds keep working without them.

module.exports = ({ config }) => {
  const googleMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  return {
    ...config,
    android: {
      ...config.android,
      ...(googleMapsKey
        ? { config: { ...config.android?.config, googleMaps: { apiKey: googleMapsKey } } }
        : {}),
    },
  };
};
