import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid JWT' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['manager', 'admin'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const periodDays = body.periodDays ?? 30
    const since = new Date()
    since.setDate(since.getDate() - periodDays)

    const { data: requests, error } = await supabase
      .from('requests')
      .select('id, status, quantity, created_at, inventory!requests_item_id_fkey(item_name, category)')
      .gte('created_at', since.toISOString())

    if (error) throw error

    const total = requests?.length ?? 0
    const approved = requests?.filter((r) => r.status === 'approved').length ?? 0
    const rejected = requests?.filter((r) => r.status === 'rejected').length ?? 0
    const pending = requests?.filter((r) => r.status === 'pending').length ?? 0

    const categoryCounts: Record<string, number> = {}
    const itemCounts: Record<string, number> = {}

    for (const req of requests ?? []) {
      if (req.status !== 'approved') continue
      const inv = req.inventory as { item_name: string; category: string } | null
      const cat = inv?.category ?? 'accessories'
      categoryCounts[cat] = (categoryCounts[cat] ?? 0) + req.quantity
      const name = inv?.item_name ?? 'Unknown'
      itemCounts[name] = (itemCounts[name] ?? 0) + 1
    }

    const report = {
      periodDays,
      totalRequests: total,
      approved,
      rejected,
      pending,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      inventoryUsage: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
      topRequestedItems: Object.entries(itemCounts)
        .map(([itemName, count]) => ({ itemName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      generatedAt: new Date().toISOString(),
    }

    await supabase.from('monthly_reports').insert({
      generated_by: user.id,
      report_data: report,
    })

    return new Response(JSON.stringify({ data: report }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
