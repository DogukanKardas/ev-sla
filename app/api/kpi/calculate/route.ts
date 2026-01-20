import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { calculateAllKPIs } from '@/lib/kpi/calculator'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { month, year, user_id } = body

  // Allow admins/managers to calculate for other users
  const targetUserId = user_id || user.id

  if (targetUserId !== user.id) {
    // Check if user is admin or manager
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  if (!month || !year) {
    return NextResponse.json({ error: 'Month and year required' }, { status: 400 })
  }

  try {
    const kpiData = await calculateAllKPIs(targetUserId, month, year)

    // Get or create KPI metric record
    const { data: existingMetric } = await supabase
      .from('kpi_metrics')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('month', month)
      .eq('year', year)
      .single()

    if (existingMetric) {
      // Update existing
      const { data, error } = await supabase
        .from('kpi_metrics')
        .update({
          ...kpiData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingMetric.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // Create new
      const { data, error } = await supabase
        .from('kpi_metrics')
        .insert({
          user_id: targetUserId,
          month,
          year,
          ...kpiData,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

