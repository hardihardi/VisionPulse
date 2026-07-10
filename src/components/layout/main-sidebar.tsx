"use client"

import * as React from "react"
import {
  Activity,
  History,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Video,
  Menu,
  ChevronRight,
  LogOut,
  User,
  Plus
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Camera Feeds",
    url: "/camera-feeds",
    icon: Video,
  },
  {
    title: "Plate Search",
    url: "/plate-search",
    icon: Search,
  },
  {
    title: "History",
    url: "/history",
    icon: History,
  },
  {
    title: "Analytics",
    url: "/traffic",
    icon: Activity,
  },
]

export function MainSidebar() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar shadow-xl">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50 bg-sidebar/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 w-full">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-foreground leading-none">VisionPulse</span>
            <span className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wider">AI Traffic Control</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  onClick={handleLinkClick}
                  className={cn(
                    "h-11 transition-all duration-200 hover:bg-primary/10",
                    isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className={cn("h-4.5 w-4.5", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                    {isActive && <div className="ml-auto w-1 h-4 bg-primary rounded-full group-data-[collapsible=icon]:hidden" />}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        <div className="mt-8 px-4 py-2 group-data-[collapsible=icon]:hidden">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-4">Systems</p>
          <div className="space-y-1">
            <button className="flex items-center gap-3 w-full px-2 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
              <Settings className="h-3.5 w-3.5" />
              <span>Config Manager</span>
            </button>
            <button className="flex items-center gap-3 w-full px-2 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Source</span>
            </button>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50 bg-sidebar/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full data-[state=open]:bg-accent hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-8 w-8 border border-primary/20 ring-2 ring-primary/5">
                  <AvatarImage src="/avatar-placeholder.png" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0 group-data-[collapsible=icon]:hidden">
                  <span className="text-xs font-bold text-foreground truncate w-full">Administrator</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full">admin@visionpulse.ai</span>
                </div>
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="right"
            align="end"
            className="w-56 mb-2"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
