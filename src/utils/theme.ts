/**
 * Utility functions for theme resolution, document theme application,
 * and system preference listener management.
 */

import type { ThemePreference } from '../types/calculator';

export type ResolvedTheme = 'light' | 'dark';

/**
 * Resolves the active theme ('light' or 'dark') given a user preference
 * and optional explicit media query match state.
 */
export function resolveTheme(
  preference: ThemePreference,
  isDarkMedia?: boolean
): ResolvedTheme {
  if (preference === 'light') {
    return 'light';
  }
  if (preference === 'dark') {
    return 'dark';
  }

  // preference === 'system'
  if (isDarkMedia !== undefined) {
    return isDarkMedia ? 'dark' : 'light';
  }

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      const query = window.matchMedia('(prefers-color-scheme: dark)');
      return query.matches ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  }

  return 'dark';
}

/**
 * Applies the resolved theme to the root HTML document element
 * via data-theme attribute and Tailwind .dark / .light classes.
 */
export function applyThemeToDocument(resolvedTheme: ResolvedTheme): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.setAttribute('data-theme', resolvedTheme);

  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  // Dynamically update theme-color meta tag for mobile browser status bar tinting
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#090D16' : '#F8FAFC');
  }
}

/**
 * Subscribes to system (OS/browser) color-scheme changes.
 * Returns an unbind cleanup function.
 */
export function watchSystemTheme(onChange: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent | MediaQueryList) => {
      onChange(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler);
      return () => {
        mediaQuery.removeEventListener('change', handler);
      };
    }

    // Fallback for older browser engines
    const legacyQuery = mediaQuery as unknown as {
      addListener?: (cb: (e: MediaQueryListEvent) => void) => void;
      removeListener?: (cb: (e: MediaQueryListEvent) => void) => void;
    };

    if (typeof legacyQuery.addListener === 'function') {
      legacyQuery.addListener(handler);
      return () => {
        legacyQuery.removeListener?.(handler);
      };
    }
  } catch {
    return () => {};
  }

  return () => {};
}
