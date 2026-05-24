"use client"

import { useState, useEffect } from "react"
import { BarChart3, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { fetchReportsData, generateReport } from "@/app/actions/reports"
import { useServerAction } from "@/lib/hooks/use-server-action"
import { useAuth } from "@/lib/auth-context"
import { CATEGORY_LABELS } from "@/types/erp"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReportsPage() {
  const { role } = useAuth()
  const { data, loading, error, refresh } = useServerAction(() => fetchReportsData(), [])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  if (role === "employee") {
    return <p className="p-8 text-zinc-500">Reports are available to managers and admins only.</p>
  }

  const monthlyStats = data?.monthlyStats ?? []
  const categoryUsage = data?.categoryUsage ?? []
  const latestReport = data?.savedReports?.[0]?.reportData

  const totalRequests = monthlyStats.reduce((s, m) => s + m.submitted, 0)
  const totalApproved = monthlyStats.reduce((s, m) => s + m.approved, 0)
  const approvalRate = totalRequests > 0 ? Math.round((totalApproved / totalRequests) * 100) : 0

  const chartUsage = categoryUsage.map((c) => ({
    category: CATEGORY_LABELS[c.category],
    count: c.count,
  }))

  const handleGenerate = async () => {
    setGenerating(true)
    const result = await generateReport(30)
    setGenerating(false)
    if (result.success) {
      toast.success("Report generated and saved")
      refresh()
    } else toast.error(result.error)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="text-blue-500" /> Reports</h1>
          <p className="text-sm text-zinc-500">Analytics from live database</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="gap-2 bg-blue-600">
          <Download className="size-4" /> {generating ? "Generating..." : "Generate Report"}
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-48 w-full bg-white/5" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-[#0A0A0A] border-white/5"><CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-500 uppercase">Total Requests</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{latestReport?.totalRequests ?? totalRequests}</p></CardContent></Card>
            <Card className="bg-[#0A0A0A] border-white/5"><CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-500 uppercase">Approved</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-400">{latestReport?.approved ?? totalApproved}</p></CardContent></Card>
            <Card className="bg-[#0A0A0A] border-white/5"><CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-500 uppercase">Approval Rate</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{latestReport?.approvalRate ?? approvalRate}%</p></CardContent></Card>
            <Card className="bg-[#0A0A0A] border-white/5"><CardHeader className="pb-2"><CardTitle className="text-xs text-zinc-500 uppercase">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-400">{latestReport?.pending ?? 0}</p></CardContent></Card>
          </div>

          <Card className="bg-[#0A0A0A] border-white/5">
            <CardHeader><CardTitle>Monthly Request Trends</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ submitted: { label: "Submitted", color: "#3b82f6" }, approved: { label: "Approved", color: "#10b981" }, rejected: { label: "Rejected", color: "#ef4444" } }} className="h-[280px] w-full">
                <AreaChart data={monthlyStats}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="submitted" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="approved" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="rejected" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#0A0A0A] border-white/5">
            <CardHeader><CardTitle>Approved Usage by Category</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ count: { label: "Units", color: "#3b82f6" } }} className="h-[280px] w-full">
                <BarChart data={chartUsage}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="category" tick={{ fill: "#71717a", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#71717a", fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
