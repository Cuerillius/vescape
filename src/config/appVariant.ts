const APP_VARIANTS = {
  production: { applicationId: 'app.vescape', name: 'vescape' },
  development: { applicationId: 'app.vescape.dev', name: 'vescape dev' },
  // A third install for trying a branch on a phone next to the store and dev apps.
  preview: { applicationId: 'app.vescape.preview', name: 'vescape preview' },
} as const

type AppVariant = keyof typeof APP_VARIANTS

const configuredAppVariant = process.env.EXPO_PUBLIC_VESCAPE_APP_VARIANT ?? 'production'

function isAppVariant(value: string): value is AppVariant {
  return Object.hasOwn(APP_VARIANTS, value)
}

if (!isAppVariant(configuredAppVariant)) {
  throw new Error(
    `Invalid EXPO_PUBLIC_VESCAPE_APP_VARIANT "${configuredAppVariant}"; expected one of ${Object.keys(APP_VARIANTS).join(', ')}.`,
  )
}

const appVariant: AppVariant = configuredAppVariant
export const isDevelopmentApp = appVariant === 'development'
export const applicationId = APP_VARIANTS[appVariant].applicationId
export const appName = APP_VARIANTS[appVariant].name
