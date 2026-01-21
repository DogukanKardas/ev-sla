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

  // Check if user is admin or manager
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const user_id = searchParams.get('user_id')

  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (user_id) {
    query = query.eq('user_id', user_id)
  }

  const { data: tasksData, error } = await query.limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Manually fetch related data
  if (tasksData && tasksData.length > 0) {
    const userIds = [...new Set(tasksData.map(t => t.user_id))]
    const locationIds = tasksData.map(t => t.location_id).filter(Boolean)
    const assignedByIds = tasksData.map(t => t.assigned_by).filter(Boolean)

    // Fetch all related data in parallel
    const [locationsRes, assignedToRes, assignedByRes] = await Promise.all([
      locationIds.length > 0
        ? supabase.from('locations').select('*').in('id', locationIds)
        : Promise.resolve({ data: [] }),
      supabase.from('user_profiles').select('user_id, full_name, role').in('user_id', userIds),
      assignedByIds.length > 0
        ? supabase.from('user_profiles').select('user_id, full_name').in('user_id', assignedByIds)
        : Promise.resolve({ data: [] }),
    ])

    // Merge data
    const enrichedTasks = tasksData.map(task => ({
      ...task,
      user_profiles: assignedToRes.data?.find(p => p.user_id === task.user_id) || null,
      locations: locationsRes.data?.find(loc => loc.id === task.location_id) || null,
      assigned_by_profile: assignedByRes.data?.find(p => p.user_id === task.assigned_by) || null,
    }))

    return NextResponse.json(enrichedTasks)
  }

  return NextResponse.json(tasksData || [])
}

export async function PUT(request: Request) {
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
  const { id, title, description, status, due_date, user_id, location_id, location_address, location_notes } = body

  if (!id) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
  }

  const updateData: any = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (status !== undefined) updateData.status = status
  if (due_date !== undefined) updateData.due_date = due_date || null
  if (user_id !== undefined) updateData.user_id = user_id
  if (location_id !== undefined) updateData.location_id = location_id || null
  if (location_address !== undefined) updateData.location_address = location_address || null
  if (location_notes !== undefined) updateData.location_notes = location_notes || null

  // If marking as completed, set completed_at if not already set
  if (status === 'completed') {
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('completed_at, started_at')
      .eq('id', id)
      .single()

    if (!currentTask?.completed_at) {
      updateData.completed_at = new Date().toISOString()
      
      // Calculate duration if started_at exists
      if (currentTask?.started_at) {
        const start = new Date(currentTask.started_at)
        const end = new Date()
        updateData.duration_minutes = Math.floor((end.getTime() - start.getTime()) / 60000)
      }
    }
  }

  // If marking as in_progress, set started_at if not already set
  if (status === 'in_progress') {
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('started_at')
      .eq('id', id)
      .single()

    if (!currentTask?.started_at) {
      updateData.started_at = new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
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

  // Check if user is admin or manager
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

