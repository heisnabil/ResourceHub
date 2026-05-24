"use client"

import { AppSidebar } from "@/components/features/dashboard/app-sidebar"
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Menu } from "lucide-react"
import Link from "next/link"
import { NotificationBell } from "@/components/features/dashboard/notification-bell"
import { Logo } from "@/components/ui/logo"

function PlatformContent({ children }: { children: React.ReactNode }) {
  const { state, isMobile, openMobile } = useSidebar()
  const isSidebarOpen = isMobile ? openMobile : state === "expanded"

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#050505] text-white">
      {/* Top Header Bar */}
      {!isSidebarOpen && (
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl px-4 sm:px-6">
          <SidebarTrigger className="size-9 cursor-pointer text-zinc-400 hover:text-blue-400 transition-colors hover:bg-white/10 rounded-lg">
            <Menu className="size-5" />
          </SidebarTrigger>
          <Link href="/dashboard" className="flex items-center">
            <Logo className="text-sm" iconSize="size-5" />
          </Link>
          <div className="flex-1" />
          <NotificationBell />
        </header>
      )}

      {/* Bottom portion containing Sidebar and Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <AppSidebar className={isSidebarOpen ? "top-0" : "top-14"} />

        {/* Main content — scrollable independently */}
        <main className="flex-1 overflow-y-auto relative min-h-0">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <PlatformContent>{children}</PlatformContent>
    </SidebarProvider>
  )
}