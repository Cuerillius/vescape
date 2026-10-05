import { AndroidConfig, withAndroidManifest, type ConfigPlugin } from 'expo/config-plugins'

// Adaptive theme tokens are Android `PlatformColor` resources, which React Native resolves once
// when a view's props are applied. With `uiMode` in `configChanges` the activity survives an
// appearance change, so already-mounted views keep their old colors until the app restarts.
// Dropping it makes Android recreate the activity on a theme switch; the JS runtime (navigation,
// stores, BLE) survives and the recreated views resolve the new resources.
const withThemeRecreate: ConfigPlugin = (config) =>
  withAndroidManifest(config, (cfg) => {
    const main = AndroidConfig.Manifest.getMainActivityOrThrow(cfg.modResults)
    const changes = main.$['android:configChanges']
    if (changes) {
      main.$['android:configChanges'] = changes
        .split('|')
        .filter((change) => change !== 'uiMode')
        .join('|')
    }
    return cfg
  })

export default withThemeRecreate
