"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { SectionCards } from "@/components/features/dashboard/section-cards"
import { ChartAreaInteractive } from "@/components/features/dashboard/chart-area-interactive"
import { DataTable } from "@/components/features/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { ClipboardList, Package, FileText, Plus, CircleDot } from "lucide-react"
import Link from "next/link"
import { fetchDashboard } from "@/app/actions/dashboard"
import { useServerAction } from "@/lib/hooks/use-server-action"
import { toast } from "sonner"
import { format } from "date-fns"

const activityTypeStyles: Record<string, { dot: string }> = {
  request_submitted: { dot: "bg-blue-500" },
  request_approved: { dot: "bg-emerald-500" },
  request_rejected: { dot: "bg-red-500" },
  inventory_updated: { dot: "bg-blue-400" },
  item_added: { dot: "bg-purple-500" },
  low_stock_alert: { dot: "bg-orange-500" },
}

export default function DashboardPage() {
  const { data, loading, error } = useServerAction(() => fetchDashboard(), [])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 space-y-8 py-6 sm:py-10 px-4 sm:px-6 lg:px-10"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Dashboard</h2>
            <p className="text-sm text-zinc-500">Live metrics from Supabase</p>
          </div>
          <Link href="/requests">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
              <Plus className="size-4" /> New Request
            </Button>
          </Link>
        </div>

        <SectionCards stats={data?.stats ?? null} loading={loading} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <ChartAreaInteractive data={data?.monthlyStats ?? []} loading={loading} />
            <DataTable data={data?.recentRequests ?? []} loading={loading} />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Quick Actions</h3>
              <div className="grid gap-3">
                {[
                  { href: "/requests", icon: ClipboardList, label: "New Request" },
                  { href: "/inventory", icon: Package, label: "View Inventory" },
                  { href: "/reports", icon: FileText, label: "Reports" },
                ].map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-[#0A0A0A] hover:border-blue-500/30">
                      <item.icon className="size-5 text-blue-500" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Recent Activity</h3>
              <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl divide-y divide-white/5">
                {(data?.activity ?? []).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-4">
                    <div className={`mt-1.5 size-2 rounded-full ${activityTypeStyles[item.action]?.dot ?? "bg-zinc-500"}`} />
                    <div>
                      <p className="text-sm text-zinc-300">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-600">
                        <span>{item.userName ?? "System"}</span>
                        <CircleDot className="size-1.5" />
                        <span>{format(new Date(item.createdAt), "MMM d")}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {!loading && (data?.activity?.length ?? 0) === 0 && (
                  <p className="p-4 text-sm text-zinc-500 text-center">No activity yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

