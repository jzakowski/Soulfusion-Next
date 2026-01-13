"use client"

import { useEffect } from "react"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  Home,
  Bed,
  Users,
  Calendar,
  BookOpen,
  Heart,
  MessageCircle,
  Settings,
  User,
  X,
  Menu,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuthStore } from "@/lib/stores/auth-store";

const navigation = [
  { name: "Home", href: "/app", icon: Home },
  { name: "Übernachtungen", href: "/uebernachtungen", icon: Bed },
  { name: "Club", href: "/club", icon: Users },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Workshops", href: "/workshops", icon: BookOpen },
  { name: "Dating", href: "/dating", icon: Heart },
  { name: "Bubbles", href: "/bubbles", icon: MessageCircle },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();

  // Debug: Log user to console
  useEffect(() => {
    console.log("AppLayout - User:", user);
    console.log("AppLayout - displayName:", user?.display_name);
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
        <button
          onClick={toggleSidebar}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/app" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">SoulFusion</span>
        </Link>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-background transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/app" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">SoulFusion</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t p-4">
            {user ? (
              <div className="flex items-center gap-3">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name || "User"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {user.display_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{user.display_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.city || 'User'}</p>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        {children}
      </main>

      {/* Desktop Quick Actions */}
      <nav className="fixed bottom-0 right-0 z-40 hidden lg:flex lg:flex-col lg:items-center lg:gap-2 lg:border-l lg:bg-background lg:p-4">
        <Link
          href="/settings"
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>
        <Link
          href="/profile"
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          title="Profile"
        >
          <User className="h-5 w-5" />
        </Link>
      </nav>
    </div>
  );
}
