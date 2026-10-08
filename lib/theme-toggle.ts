export type Theme = "light" | "dark";
export type BrowserColorScheme = "only light" | "dark";

export function browserColorScheme(theme: Theme): BrowserColorScheme {
  return theme === "light" ? "only light" : "dark";
}

export function readTheme(readStoredValue: () => string | null): Theme {
  try {
    const value = readStoredValue();
    return value === "light" || value === "dark" ? value : "light";
  } catch {
    return "light";
  }
}

export function nextTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

export function applyAndPersistTheme(
  theme: Theme,
  apply: (theme: Theme) => void,
  persist: (theme: Theme) => void,
): void {
  // Apply immediately. Storage can be unavailable in embedded/mobile browsers,
  // and a persistence failure must not cancel the visible theme change.
  apply(theme);
  try {
    persist(theme);
  } catch {
    // Keep the current session usable even when localStorage is blocked/full.
  }
}
