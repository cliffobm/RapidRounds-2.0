export type ThemePreference = 'light' | 'dark' | 'system'

export function resolveTheme(
  theme: ThemePreference,
  systemDark: boolean
): boolean {
  return theme === 'dark' || (theme === 'system' && systemDark)
}

// Runs before the body is painted; the provider then owns the same html class.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})();`
