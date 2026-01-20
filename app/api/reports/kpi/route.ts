import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const user_id = searchParams.get('user_id')

  // Allow admins/managers to view other users' reports
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

  // Get KPI metrics
  const { data: kpiMetric } = await supabase
    .from('kpi_metrics')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('month', parseInt(month))
    .eq('year', parseInt(year))
    .single()

  // Get KPI evaluation
  const { data: evaluation } = await supabase
    .from('kpi_evaluations')
    .select('*, user_profiles!kpi_evaluations_evaluated_by_fkey(full_name)')
    .eq('user_id', targetUserId)
    .eq('month', parseInt(month))
    .eq('year', parseInt(year))
    .single()

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('user_id', targetUserId)
    .single()

  // Get attendance summary
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]

  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('check_in, check_out')
    .eq('user_id', targetUserId)
    .gte('check_in', startDate)
    .lte('check_in', endDate)

  // Get work logs summary
  const { data: workLogs } = await supabase
    .from('work_logs')
    .select('duration_minutes')
    .eq('user_id', targetUserId)
    .gte('date', startDate)
    .lte('date', endDate)

  // Get message response summary
  const { data: messageResponses } = await supabase
    .from('message_responses')
    .select('response_time_seconds')
    .eq('user_id', targetUserId)
    .gte('responded_at', startDate)
    .lte('responded_at', endDate)

  return NextResponse.json({
    user: profile,
    month: parseInt(month),
    year: parseInt(year),
    kpi_metric: kpiMetric,
    evaluation: evaluation,
    summary: {
      total_attendance_days: attendanceRecords?.length || 0,
      total_work_logs: workLogs?.length || 0,
      total_message_responses: messageResponses?.length || 0,
    },
  })
}

