'use client'

import * as React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { MonthlyStats } from '@/types/erp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useIsMobile } from '@/hooks/use-mobile'
import { Skeleton } from '@/components/ui/skeleton'

const chartConfig = {
  submitted: { label: 'Submitted', color: 'oklch(0.546 0.245 262.881)' },
  approved: { label: 'Approved', color: 'oklch(0.696 0.17 162.48)' },
  rejected: { label: 'Rejected', color: 'oklch(0.645 0.246 16.439)' },
} satisfies ChartConfig

interface ChartAreaInteractiveProps {
  data: MonthlyStats[]
  loading?: boolean
}

export function ChartAreaInteractive({ data, loading }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState('12m')

  React.useEffect(() => {
    if (isMobile) setTimeRange('6m')
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12
    return data.slice(-months)
  }, [timeRange, data])

  if (loading) {
    return <Skeleton className="h-[350px] w-full rounded-2xl bg-white/5" />
  }

  return (
    <Card className="@container/chart bg-[#0A0A0A] border-white/5">
      <CardHeader className="flex flex-col items-stretch gap-2 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col justify-center gap-1">
          <CardTitle className="text-white">Request Trends</CardTitle>
          <CardDescription>Monthly request activity from database</CardDescription>
        </div>
        <ToggleGroup type="single" value={timeRange} onValueChange={(v) => v && setTimeRange(v)} className="hidden sm:flex">
          <ToggleGroupItem value="3m" className="text-xs">3M</ToggleGroupItem>
          <ToggleGroupItem value="6m" className="text-xs">6M</ToggleGroupItem>
          <ToggleGroupItem value="12m" className="text-xs">12M</ToggleGroupItem>
        </ToggleGroup>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-28 sm:hidden bg-[#111] border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 months</SelectItem>
            <SelectItem value="6m">6 months</SelectItem>
            <SelectItem value="12m">12 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={filteredData}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="submitted" stroke="var(--color-submitted)" fill="var(--color-submitted)" fillOpacity={0.15} />
            <Area type="monotone" dataKey="approved" stroke="var(--color-approved)" fill="var(--color-approved)" fillOpacity={0.15} />
            <Area type="monotone" dataKey="rejected" stroke="var(--color-rejected)" fill="var(--color-rejected)" fillOpacity={0.15} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
