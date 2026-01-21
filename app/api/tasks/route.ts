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
  const status = searchParams.get('status')
  const user_id = searchParams.get('user_id')

  // Check if viewing own tasks or if admin/manager
  const targetUserId = user_id || user.id

  if (targetUserId !== user.id) {
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
    .from('tasks')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data: tasksData, error } = await query.limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Manually fetch related data to avoid relationship errors
  if (tasksData && tasksData.length > 0) {
    const locationIds = tasksData.map(t => t.location_id).filter(Boolean)
    const assignedByIds = tasksData.map(t => t.assigned_by).filter(Boolean)

    // Fetch locations
    const { data: locationsData } = locationIds.length > 0
      ? await supabase.from('locations').select('*').in('id', locationIds)
      : { data: [] }

    // Fetch user profiles for assigned_by
    const { data: profilesData } = assignedByIds.length > 0
      ? await supabase.from('user_profiles').select('user_id, full_name').in('user_id', assignedByIds)
      : { data: [] }

    // Merge data
    const enrichedTasks = tasksData.map(task => ({
      ...task,
      locations: locationsData?.find(loc => loc.id === task.location_id) || null,
      user_profiles: profilesData?.find(p => p.user_id === task.assigned_by) || null,
    }))

    return NextResponse.json(enrichedTasks)
  }

  return NextResponse.json(tasksData || [])
}

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
  const { user_id, title, description, location_id, location_address, location_notes, due_date } = body

  if (!user_id || !title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id,
      title,
      description: description || null,
      location_id: location_id || null,
      location_address: location_address || null,
      location_notes: location_notes || null,
      due_date: due_date || null,
      assigned_by: user.id,
      status: 'pending',
    })
    .select(`
      *,
      locations(id, name, address, latitude, longitude)
    `)
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
  const { id, status, completed_at } = body

  if (!id) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
  }

  const updateData: any = {}
  if (status !== undefined) updateData.status = status
  if (completed_at !== undefined) updateData.completed_at = completed_at

  // If marking as completed, set completed_at
  if (status === 'completed' && !completed_at) {
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('tasks')
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

