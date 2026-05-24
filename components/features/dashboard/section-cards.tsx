'use client'

import { ClipboardList, CheckCircle2, Package, AlertTriangle } from 'lucide-react'
import type { DashboardStats } from '@/types/erp'
import { Skeleton } from '@/components/ui/skeleton'

interface SectionCardsProps {
  stats: DashboardStats | null
  loading?: boolean
}

export function SectionCards({ stats, loading }: SectionCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />
        ))}
      </div>
    )
  }

  const cards = [
    { title: 'Pending Requests', value: stats.pendingRequests, icon: ClipboardList, accent: 'amber' },
    { title: 'Approved Requests', value: stats.approvedRequests, icon: CheckCircle2, accent: 'emerald' },
    { title: 'Inventory Items', value: stats.inventoryCount, icon: Package, accent: 'blue' },
    { title: 'Low Stock Alerts', value: stats.lowStockCount, icon: AlertTriangle, accent: 'orange' },
  ]

  const accentColors: Record<string, { iconBg: string; text: string }> = {
    amber: { iconBg: 'bg-amber-500/10', text: 'text-amber-500' },
    emerald: { iconBg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    blue: { iconBg: 'bg-blue-500/10', text: 'text-blue-500' },
    orange: { iconBg: 'bg-orange-500/10', text: 'text-orange-500' },
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const colors = accentColors[card.accent]
        return (
          <div key={card.title} className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{card.title}</p>
                <div className={`flex size-8 items-center justify-center rounded-lg ${colors.iconBg}`}>
                  <card.icon className={`size-4 ${colors.text}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
