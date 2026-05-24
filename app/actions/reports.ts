'use server'

import { getSupabase, wrapAction } from '@/app/actions/_utils'
import { AuthService } from '@/lib/services/auth.service'
import { ReportService } from '@/lib/services/report.service'
import type { ActionResult, CategoryUsage, MonthlyReport, MonthlyStats } from '@/types/erp'

export async function fetchReportsData(): Promise<
  ActionResult<{
    monthlyStats: MonthlyStats[]
    categoryUsage: CategoryUsage[]
    savedReports: MonthlyReport[]
  }>
> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    await AuthService.requireRole(supabase, ['manager', 'admin'])

    const [monthlyStats, categoryUsage, savedReports] = await Promise.all([
      ReportService.getMonthlyStats(supabase),
      ReportService.getCategoryUsage(supabase),
      ReportService.listReports(supabase, 5),
    ])

    return { monthlyStats, categoryUsage, savedReports }
  })
}

export async function generateReport(periodDays = 30): Promise<ActionResult<MonthlyReport>> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    const profile = await AuthService.requireRole(supabase, ['manager', 'admin'])
    return ReportService.generateReport(supabase, profile.id, periodDays)
  })
}
