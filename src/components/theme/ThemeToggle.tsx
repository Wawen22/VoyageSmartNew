import { Moon, Sun, Monitor, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { isPro } = useSubscription();

  if (!isPro) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full opacity-50 cursor-not-allowed">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <Lock className="absolute -top-1 -right-1 w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="sr-only">Cambia tema (PRO)</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Passa a PRO per sbloccare la Dark Mode 🌙</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambia tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl">
        <DropdownMenuItem onClick={() => setTheme("light")} className={cn("gap-2 cursor-pointer", theme === 'light' && "bg-primary/10 text-primary")}>
          <Sun className="h-4 w-4" />
          <span>Chiaro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className={cn("gap-2 cursor-pointer", theme === 'dark' && "bg-primary/10 text-primary")}>
          <Moon className="h-4 w-4" />
          <span>Scuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className={cn("gap-2 cursor-pointer", theme === 'system' && "bg-primary/10 text-primary")}>
          <Monitor className="h-4 w-4" />
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
