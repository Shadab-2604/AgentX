"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import {
  LayoutDashboard,
  Users,
  Upload,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const adminNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agents", href: "/dashboard/agents", icon: Users },
  { name: "Upload Files", href: "/dashboard/upload", icon: Upload },
  { name: "Agent Tasks", href: "/dashboard/tasks", icon: FileText },
  //{ name: "Sub-Agent Tasks", href: "/dashboard/sub-agents", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const agentNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sub-Agents", href: "/dashboard/sub-agents", icon: Users },
  { name: "Imports", href: "/dashboard/upload", icon: Upload },
  { name: "Sub-Agent Tasks", href: "/dashboard/tasks", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-card shadow-md"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">AX</span>
                </div>
                <span className="font-bold text-sidebar-foreground">AgentX</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {(user?.role === "agent" ? agentNav : adminNav).map((item) => {
              const isActive = pathname === item.href || (item.href.includes("?") ? pathname.startsWith(item.href.split("?")[0]) : false)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isCollapsed && "justify-center",
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-sidebar-border">
            {!isCollapsed && user && (
              <div className="mb-3">
                <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/70">{user.email}</p>
              </div>
            )}
            <Button
              variant="ghost"
              onClick={logout}
              className={cn(
                "w-full text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground",
                isCollapsed ? "px-2" : "justify-start",
              )}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("transition-all duration-300", isCollapsed ? "lg:ml-16" : "lg:ml-64")}>
        <div className="lg:hidden h-16" /> {/* Spacer for mobile menu button */}
        {children}
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
    </div>
  )
}
