import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className={cn("app-theme app-shell relative min-h-screen overflow-hidden", className)}>
      <Navbar />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="app-grid absolute inset-0" />
        <div className="app-orb app-orb-1" />
        <div className="app-orb app-orb-2" />
        <div className="app-orb app-orb-3" />
      </div>
      {children}
    </div>
  );
}
