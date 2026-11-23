// Extends app.json with values that come from the environment (EAS secrets /
// local .env) so no key is committed. Every block is skipped when its variable
// is missing, so local builds keep working without them.

module.exports = ({ config }) => {
  const facebookAppId = process.env.FACEBOOK_APP_ID;
  const facebookClientToken = process.env.FACEBOOK_CLIENT_TOKEN;
  const googleMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  const facebookEnabled = Boolean(facebookAppId && facebookClientToken);

  return {
    ...config,
    android: {
      ...config.android,
      ...(googleMapsKey
        ? { config: { ...config.android?.config, googleMaps: { apiKey: googleMapsKey } } }
        : {}),
    },
    plugins: [
      ...(config.plugins ?? []),
      ...(facebookEnabled
        ? [[
            'react-native-fbsdk-next',
            {
              appID: facebookAppId,
              clientToken: facebookClientToken,
              displayName: 'Domilix',
              scheme: `fb${facebookAppId}`,
              isAutoInitEnabled: true,
              autoLogAppEventsEnabled: true,
              // Needed to attribute installs to Meta ads (declare it in Play data safety).
              advertiserIDCollectionEnabled: true,
            },
          ]]
        : []),
    ],
    extra: {
      ...config.extra,
      facebookEnabled,
    },
  };
};
