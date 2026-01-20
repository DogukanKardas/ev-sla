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

  // Allow admins/managers to view other users' KPIs
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

  let query = supabase
    .from('kpi_metrics')
    .select('*')
    .eq('user_id', targetUserId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (month) {
    query = query.eq('month', parseInt(month))
  }

  if (year) {
    query = query.eq('year', parseInt(year))
  }

  const { data, error } = await query.limit(12)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

