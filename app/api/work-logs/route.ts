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
  const date = searchParams.get('date')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  let query = supabase
    .from('work_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })

  if (date) {
    query = query.eq('date', date)
  }

  if (startDate) {
    query = query.gte('date', startDate)
  }

  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query.limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { date, description, start_time, end_time, project_tag } = body

  if (!date || !description || !start_time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  let duration_minutes = null
  if (end_time) {
    const start = new Date(`${date}T${start_time}`)
    const end = new Date(`${date}T${end_time}`)
    duration_minutes = Math.floor((end.getTime() - start.getTime()) / 60000)
  }

  const { data, error } = await supabase
    .from('work_logs')
    .insert({
      user_id: user.id,
      date,
      description,
      start_time,
      end_time: end_time || null,
      duration_minutes,
      project_tag: project_tag || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, description, start_time, end_time, project_tag } = body

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  // Get existing log to calculate duration
  const { data: existingLog } = await supabase
    .from('work_logs')
    .select('date, start_time, end_time')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existingLog) {
    return NextResponse.json({ error: 'Work log not found' }, { status: 404 })
  }

  const updateData: any = {}
  if (description !== undefined) updateData.description = description
  if (start_time !== undefined) updateData.start_time = start_time
  if (end_time !== undefined) updateData.end_time = end_time
  if (project_tag !== undefined) updateData.project_tag = project_tag

  // Recalculate duration if times changed
  const finalStartTime = start_time || existingLog.start_time
  const finalEndTime = end_time !== undefined ? end_time : existingLog.end_time

  if (finalEndTime) {
    const start = new Date(`${existingLog.date}T${finalStartTime}`)
    const end = new Date(`${existingLog.date}T${finalEndTime}`)
    updateData.duration_minutes = Math.floor((end.getTime() - start.getTime()) / 60000)
  }

  const { data, error } = await supabase
    .from('work_logs')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('work_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

