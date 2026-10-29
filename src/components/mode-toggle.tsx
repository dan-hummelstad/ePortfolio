import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { dark, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid size-8 place-items-center border border-(--ink) bg-(--bg) text-(--ink) hover:bg-(--hover)"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="size-4" strokeWidth={1.5} /> : <Moon className="size-4" strokeWidth={1.5} />}
    </button>
  )
}
