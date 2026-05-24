'use client'

import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { ResourceRequest } from '@/types/erp'
import { CATEGORY_LABELS } from '@/types/erp'
import { Skeleton } from '@/components/ui/skeleton'

const statusStyles = {
  pending: 'bg-amber-500/10 text-amber-500',
  approved: 'bg-emerald-500/10 text-emerald-500',
  rejected: 'bg-red-500/10 text-red-400',
} as const

interface DataTableProps {
  data: ResourceRequest[]
  loading?: boolean
}

export function DataTable({ data, loading }: DataTableProps) {
  if (loading) {
    return <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />
  }

  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-widest text-zinc-400">Recent Requests</h3>
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">{data.length} shown</span>
      </div>
      <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 text-[10px] text-zinc-500 uppercase font-bold tracking-widest border-b border-white/5">
        <div className="col-span-2">Item</div>
        <div className="col-span-2">Category</div>
        <div className="col-span-1 text-center">Qty</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-3">Requested By</div>
        <div className="col-span-2 text-right">Date</div>
      </div>
      <div className="divide-y divide-white/5">
        {data.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-500">No requests yet</div>
        ) : (
          data.map((request) => (
            <div key={request.id} className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-5 py-4 items-center hover:bg-white/[0.02]">
              <div className="col-span-2">
                <span className="text-sm font-medium text-zinc-200 truncate block">{request.itemName}</span>
              </div>
              <div className="col-span-2">
                <Badge variant="outline" className="text-[9px] border-white/5 text-zinc-400">
                  {CATEGORY_LABELS[request.itemCategory]}
                </Badge>
              </div>
              <div className="col-span-1 text-center">
                <span className="text-sm font-bold text-white">{request.quantity}</span>
              </div>
              <div className="col-span-2">
                <Badge variant="outline" className={`text-[9px] uppercase font-bold border-none ${statusStyles[request.status]}`}>
                  {request.status}
                </Badge>
              </div>
              <div className="col-span-3">
                <span className="text-sm text-zinc-300">{request.employeeName}</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-xs text-zinc-500">{format(new Date(request.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

