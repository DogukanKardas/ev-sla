import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface KPICalculationResult {
  work_hours_total: number
  avg_response_time_seconds: number
  task_completion_rate: number
  productivity_score: number
}

export async function calculateWorkHours(
  userId: string,
  month: number,
  year: number
): Promise<number> {
  const supabase = getSupabaseClient()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  // Calculate from attendance records
  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('check_in, check_out')
    .eq('user_id', userId)
    .gte('check_in', startDate)
    .lte('check_in', endDate)

  if (!attendanceRecords || attendanceRecords.length === 0) {
    return 0
  }

  let totalMinutes = 0
  for (const record of attendanceRecords) {
    if (record.check_out) {
      const checkIn = new Date(record.check_in)
      const checkOut = new Date(record.check_out)
      const minutes = Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000)
      totalMinutes += minutes
    }
  }

  return Math.round((totalMinutes / 60) * 100) / 100 // Round to 2 decimal places
}

export async function calculateAverageResponseTime(
  userId: string,
  month: number,
  year: number
): Promise<number> {
  const supabase = getSupabaseClient()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data: responses } = await supabase
    .from('message_responses')
    .select('response_time_seconds')
    .eq('user_id', userId)
    .gte('responded_at', startDate)
    .lte('responded_at', endDate)

  if (!responses || responses.length === 0) {
    return 0
  }

  const totalSeconds = responses.reduce(
    (sum, r) => sum + r.response_time_seconds,
    0
  )

  return Math.floor(totalSeconds / responses.length)
}

export async function calculateTaskCompletionRate(
  userId: string,
  month: number,
  year: number
): Promise<number> {
  const supabase = getSupabaseClient()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data: tasks } = await supabase
    .from('tasks')
    .select('status')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (!tasks || tasks.length === 0) {
    return 0
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const totalTasks = tasks.filter((t) => t.status !== 'cancelled').length

  if (totalTasks === 0) {
    return 0
  }

  return Math.round((completedTasks / totalTasks) * 100 * 100) / 100 // Round to 2 decimal places
}

export async function calculateProductivityScore(
  userId: string,
  month: number,
  year: number
): Promise<number> {
  const supabase = getSupabaseClient()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  // Get work logs for the month
  const { data: workLogs } = await supabase
    .from('work_logs')
    .select('duration_minutes, description')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)

  if (!workLogs || workLogs.length === 0) {
    return 0
  }

  // Calculate total logged hours
  const totalLoggedMinutes = workLogs.reduce(
    (sum, log) => sum + (log.duration_minutes || 0),
    0
  )

  // Calculate work hours from attendance
  const workHours = await calculateWorkHours(userId, month, year)
  const workMinutes = workHours * 60

  if (workMinutes === 0) {
    return 0
  }

  // Productivity = (logged time / work time) * 100
  // Cap at 100%
  const productivity = Math.min((totalLoggedMinutes / workMinutes) * 100, 100)

  return Math.round(productivity * 100) / 100 // Round to 2 decimal places
}

export async function calculateAllKPIs(
  userId: string,
  month: number,
  year: number
): Promise<KPICalculationResult> {
  const [workHours, avgResponseTime, taskCompletion, productivity] = await Promise.all([
    calculateWorkHours(userId, month, year),
    calculateAverageResponseTime(userId, month, year),
    calculateTaskCompletionRate(userId, month, year),
    calculateProductivityScore(userId, month, year),
  ])

  return {
    work_hours_total: workHours,
    avg_response_time_seconds: avgResponseTime,
    task_completion_rate: taskCompletion,
    productivity_score: productivity,
  }
}

