import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderState = {
  theme: Theme
  dark: boolean
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState>({ theme: "system", dark: false, setTheme: () => null })

const query = "(prefers-color-scheme: dark)"
const subscribe = (cb: () => void) => { const m = matchMedia(query); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb) }

export function ThemeProvider({ children, storageKey = "vite-ui-theme" }: { children: React.ReactNode, storageKey?: string }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || "system")
  const systemDark = useSyncExternalStore(subscribe, () => matchMedia(query).matches)
  const dark = theme === "dark" || (theme === "system" && systemDark)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    document.documentElement.classList.toggle("light", !dark)
  }, [dark])

  const value = {
    theme,
    dark,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export const useTheme = () => useContext(ThemeProviderContext)
