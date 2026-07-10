"use client"

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="lg:hidden h-9 w-9" />
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">{title}</h1>
        </div>
        <div className="hidden sm:block">
            <ThemeToggle />
        </div>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground sm:text-sm lg:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
