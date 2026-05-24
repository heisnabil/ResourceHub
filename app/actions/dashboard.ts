'use server'

import { getSupabase, wrapAction } from '@/app/actions/_utils'
import { AuthService } from '@/lib/services/auth.service'
import { ReportService } from '@/lib/services/report.service'
import { ActivityService } from '@/lib/services/activity.service'
import { RequestService } from '@/lib/services/request.service'
import type { ActionResult, DashboardStats, MonthlyStats } from '@/types/erp'

export async function fetchDashboard(): Promise<
  ActionResult<{
    stats: DashboardStats
    monthlyStats: MonthlyStats[]
    recentRequests: Awaited<ReturnType<typeof RequestService.list>>['requests']
    activity: Awaited<ReturnType<typeof ActivityService.list>>
  }>
> {
  return wrapAction(async () => {
    const supabase = await getSupabase()
    await AuthService.requireAuth(supabase)
    const profile = await AuthService.requireProfile(supabase)

    const [stats, monthlyStats, requestsResult, activity] = await Promise.all([
      ReportService.getDashboardStats(supabase),
      ReportService.getMonthlyStats(supabase),
      RequestService.list(supabase, {
        pageSize: 8,
        employeeId: profile.role === 'employee' ? profile.id : undefined,
      }),
      ActivityService.list(supabase, {
        limit: 8,
        userId: profile.role === 'employee' ? profile.id : undefined,
      }),
    ])

    return {
      stats,
      monthlyStats,
      recentRequests: requestsResult.requests,
      activity,
    }
  })
}
