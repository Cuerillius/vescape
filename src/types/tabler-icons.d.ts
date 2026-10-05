// @tabler/icons-react-native maps `./*` types to `dist/icons/*.d.ts`, but ships them one folder
// deeper, so per-icon imports resolve to `any`. Every per-icon module is a default-exported Icon.
declare module '@tabler/icons-react-native/*' {
  import type { Icon } from '@tabler/icons-react-native'

  const icon: Icon
  export default icon
}
