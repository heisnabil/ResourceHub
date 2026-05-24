"use client"

import * as React from "react"
import Link from "next/link"
import { X, Package, LayoutDashboard, ClipboardList, BarChart3, Users, UserCircle } from "lucide-react"

import { Logo } from "@/components/ui/logo"
import { NavMain } from "@/components/features/dashboard/nav-main"
import { NavUser } from "@/components/features/dashboard/nav-user"
import { useAuth } from "@/lib/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role } = useAuth()
  const { setOpen, setOpenMobile, isMobile } = useSidebar()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const handleClose = () => {
    if (isMobile) {
      setOpenMobile(false)
    } else {
      setOpen(false)
    }
  }

  const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Inventory", url: "/inventory", icon: Package },
    { title: "My Requests", url: "/requests", icon: ClipboardList },
    ...(role !== "employee"
      ? [{ title: "Reports", url: "/reports", icon: BarChart3 }]
      : []),
    { title: "Profile", url: "/profile", icon: UserCircle },
  ]

  const navAdmin =
    role === "admin"
      ? [{ title: "User Management", url: "/admin", icon: Users }]
      : []

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="h-[60px] flex flex-row items-center justify-between px-4 border-b border-white/10 bg-black/20">
        <Link href="/dashboard" className="flex items-center">
          <Logo className="text-base" iconSize="size-6" />
        </Link>
        <button
          onClick={handleClose}
          className="size-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </button>
      </SidebarHeader>

      <SidebarContent className="pt-4 bg-[#0a0a0a]/40 backdrop-blur-xl">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2 px-4">
            Platform
          </SidebarGroupLabel>
          <NavMain items={navMain} />
        </SidebarGroup>

        {navAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2 px-4">
              Administration
            </SidebarGroupLabel>
            <NavMain items={navAdmin} />
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 bg-black/20">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
