import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_14px_30px_-18px_rgba(15,23,42,0.45)] hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_12px_24px_-18px_rgba(220,38,38,0.45)] hover:bg-destructive/90",
        outline:
          "border border-border bg-card/70 text-foreground hover:border-primary/30 hover:bg-primary/5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_12px_24px_-20px_rgba(15,23,42,0.35)] hover:bg-secondary/80",
        ghost: "text-foreground/70 hover:text-foreground hover:bg-muted/70",
        link: "text-primary underline-offset-4 hover:underline",
        // Premium variants for VoyageSmart
        hero: "bg-gradient-ocean text-white shadow-ocean hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        heroOutline: "border-2 border-white/80 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white",
        sunset: "bg-gradient-sunset text-white shadow-sunset hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        glass: "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 text-foreground shadow-card hover:bg-white/90 dark:hover:bg-slate-900/90",
        // Modern Auth Buttons
        authLogin:
          "relative overflow-hidden bg-sky-50 border-2 border-sky-400 text-sky-700 font-bold tracking-wide hover:bg-sky-100 hover:border-sky-500 hover:text-sky-800 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_12px_-4px_rgba(14,165,233,0.3)] hover:shadow-[0_6px_16px_-4px_rgba(14,165,233,0.4)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-sky-400/0 before:via-sky-300/20 before:to-sky-400/0 before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        authLoginDark:
          "relative overflow-hidden bg-emerald-400 border-2 border-emerald-300 text-emerald-950 font-bold tracking-wide hover:bg-emerald-300 hover:border-emerald-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_-4px_rgba(52,211,153,0.5)] hover:shadow-[0_8px_25px_-4px_rgba(52,211,153,0.6)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/40 before:to-white/0 before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        authCta:
          "relative overflow-hidden bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 text-white font-bold tracking-wide shadow-[0_8px_30px_-8px_rgba(251,146,60,0.5)] hover:shadow-[0_12px_40px_-8px_rgba(251,146,60,0.6)] hover:scale-[1.03] active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/30 before:to-white/0 before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-500 after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-t after:from-black/10 after:to-transparent",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
