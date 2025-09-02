import { Check, Moon, Sun } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

import { useTheme, type Theme } from "../global/theme-provider"
import {Button} from "../components/button";

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const themes: Theme[] = ["light", "dark", "system"]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="p-2 border border-ring/30 relative">
          <Sun className="h-[1.2rem] w-[1.2rem] text-foreground scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] text-foreground scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {themes.map((mode) => (
          <DropdownMenuItem
            key={mode}
            onClick={() => setTheme(mode)}
            className="justify-between"
          >
            <span className="capitalize">{mode}</span>
            {theme === mode && <Check className="w-4 h-4 text-green-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
