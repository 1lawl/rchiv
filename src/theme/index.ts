import { useColorScheme } from 'react-native';

import { dark, light, type Palette } from './tokens';

export * from './tokens';

/** Current palette. Follows the phone's light/dark setting. */
export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}
