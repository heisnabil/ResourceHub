import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CategoryUsage,
  DashboardStats,
  InventoryCategory,
  MonthlyReport,
  MonthlyReportData,
  MonthlyStats,
  RequestStatus,
} from '@/types/erp'
import { parseSupabaseError } from '@/lib/errors'

interface DbReport {
  id: string
  generated_by: string
  report_data: MonthlyReportData
  created_at: string
  generator: { name: string } | { name: string }[] | null
}

interface DbRequestForReport {
  id: string
  status: RequestStatus
  quantity: number
  created_at: string
  item_id: string
  item: { item_name: string; category: InventoryCategory } | { item_name: string; category: InventoryCategory }[] | null
}

function getItemRelation(
  item: DbRequestForReport['item']
): { item_name: string; category: InventoryCategory } | null {
  if (!item) return null
  if (Array.isArray(item)) return item[0] ?? null
  return item
}

export const ReportService = {
  async getDashboardStats(supabase: SupabaseClient): Promise<DashboardStats> {
    const { data, error } = await supabase.rpc('get_dashboard_stats')
    if (error) throw parseSupabaseError(error)

    return {
      pendingRequests: data.pending_requests ?? 0,
      approvedRequests: data.approved_requests ?? 0,
      inventoryCount: data.inventory_count ?? 0,
      lowStockCount: data.low_stock_count ?? 0,
    }
  },

  async getMonthlyStats(supabase: SupabaseClient): Promise<MonthlyStats[]> {
    const since = new Date()
    since.setMonth(since.getMonth() - 11)
    since.setDate(1)

    const { data, error } = await supabase
      .from('requests')
      .select('status, created_at')
      .gte('created_at', since.toISOString())

    if (error) throw parseSupabaseError(error)

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const stats: MonthlyStats[] = months.map((month) => ({
      month,
      submitted: 0,
      approved: 0,
      rejected: 0,
    }))

    for (const row of data ?? []) {
      const date = new Date(row.created_at)
      const idx = date.getMonth()
      stats[idx].submitted += 1
      if (row.status === 'approved') stats[idx].approved += 1
      if (row.status === 'rejected') stats[idx].rejected += 1
    }

    return stats
  },

  async getCategoryUsage(supabase: SupabaseClient): Promise<CategoryUsage[]> {
    const { data, error } = await supabase
      .from('requests')
      .select('quantity, item:inventory!item_id(category)')
      .eq('status', 'approved')

    if (error) throw parseSupabaseError(error)

    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      const inv = getItemRelation(row.item as DbRequestForReport['item'])
      const cat = inv?.category ?? 'accessories'
      counts[cat] = (counts[cat] ?? 0) + Number(row.quantity)
    }

    return Object.entries(counts).map(([category, count]) => ({
      category: category as InventoryCategory,
      count,
    }))
  },

  async generateReport(
    supabase: SupabaseClient,
    userId: string,
    periodDays = 30
  ): Promise<MonthlyReport> {
    const since = new Date()
    since.setDate(since.getDate() - periodDays)

    const { data, error } = await supabase
      .from('requests')
      .select('id, status, quantity, created_at, item_id, item:inventory!item_id(item_name, category)')
      .gte('created_at', since.toISOString())

    if (error) throw parseSupabaseError(error)

    const requests = (data ?? []) as DbRequestForReport[]
    const total = requests.length
    const approved = requests.filter((r) => r.status === 'approved').length
    const rejected = requests.filter((r) => r.status === 'rejected').length
    const pending = requests.filter((r) => r.status === 'pending').length

    const categoryCounts: Record<string, number> = {}
    const itemCounts: Record<string, number> = {}

    for (const req of requests.filter((r) => r.status === 'approved')) {
      const item = getItemRelation(req.item)
      const cat = item?.category ?? 'accessories'
      categoryCounts[cat] = (categoryCounts[cat] ?? 0) + req.quantity
      const name = item?.item_name ?? 'Unknown'
      itemCounts[name] = (itemCounts[name] ?? 0) + 1
    }

    const reportData: MonthlyReportData = {
      periodDays,
      totalRequests: total,
      approved,
      rejected,
      pending,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      inventoryUsage: Object.entries(categoryCounts).map(([category, count]) => ({
        category: category as InventoryCategory,
        count,
      })),
      topRequestedItems: Object.entries(itemCounts)
        .map(([itemName, count]) => ({ itemName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      generatedAt: new Date().toISOString(),
    }

    const { data: saved, error: saveError } = await supabase
      .from('monthly_reports')
      .insert({ generated_by: userId, report_data: reportData })
      .select('*, generator:profiles!generated_by(name)')
      .single()

    if (saveError) throw parseSupabaseError(saveError)

    const row = saved as DbReport
    return {
      id: row.id,
      generatedBy: row.generated_by,
      generatorName: (Array.isArray(row.generator) ? row.generator[0]?.name : row.generator?.name) ?? 'Unknown',
      reportData: row.report_data,
      createdAt: row.created_at,
    }
  },

  async listReports(supabase: SupabaseClient, limit = 10): Promise<MonthlyReport[]> {
    const { data, error } = await supabase
      .from('monthly_reports')
      .select('*, generator:profiles!generated_by(name)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw parseSupabaseError(error)

    return (data as DbReport[]).map((row) => ({
      id: row.id,
      generatedBy: row.generated_by,
      generatorName: (Array.isArray(row.generator) ? row.generator[0]?.name : row.generator?.name) ?? 'Unknown',
      reportData: row.report_data,
      createdAt: row.created_at,
    }))
  },
}
