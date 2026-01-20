import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin or manager
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { user_id, kpi_metric_id, month, year, overall_score, comments } = body

  if (!user_id || !kpi_metric_id || !month || !year || overall_score === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check if evaluation already exists
  const { data: existing } = await supabase
    .from('kpi_evaluations')
    .select('id')
    .eq('user_id', user_id)
    .eq('month', month)
    .eq('year', year)
    .single()

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('kpi_evaluations')
      .update({
        kpi_metric_id,
        overall_score,
        comments: comments || null,
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } else {
    // Create new
    const { data, error } = await supabase
      .from('kpi_evaluations')
      .insert({
        user_id,
        kpi_metric_id,
        month,
        year,
        evaluated_by: user.id,
        overall_score,
        comments: comments || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  }
}

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

  // Allow admins/managers to view other users' evaluations
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
    .from('kpi_evaluations')
    .select('*, kpi_metrics(*), user_profiles!kpi_evaluations_evaluated_by_fkey(full_name)')
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

