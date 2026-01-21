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

