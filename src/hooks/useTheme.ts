import { useEffect, useState } from 'react';
import type { ThemePreference } from '../types/calculator';
import {
  type ResolvedTheme,
  resolveTheme,
  applyThemeToDocument,
  watchSystemTheme,
} from '../utils/theme';

export interface UseThemeResult {
  readonly resolvedTheme: ResolvedTheme;
}

/**
 * Hook to synchronize the application theme with the user's preference
 * and dynamically react to system OS color scheme changes when set to 'system'.
 */
export function useTheme(preference: ThemePreference): UseThemeResult {
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(preference)
  );

  // Update theme when preference changes
  useEffect(() => {
    const currentResolved = resolveTheme(preference);
    setResolvedTheme(currentResolved);
    applyThemeToDocument(currentResolved);

    // Only listen to OS changes when in 'system' mode
    if (preference !== 'system') {
      return undefined;
    }

    const unwatch = watchSystemTheme((isDark) => {
      const nextResolved = isDark ? 'dark' : 'light';
      setResolvedTheme(nextResolved);
      applyThemeToDocument(nextResolved);
    });

    return unwatch;
  }, [preference]);

  return { resolvedTheme };
}
