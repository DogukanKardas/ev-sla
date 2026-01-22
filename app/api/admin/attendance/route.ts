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
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')
  const user_id = searchParams.get('user_id')

  let query = supabase
    .from('attendance')
    .select('*')
    .order('check_in', { ascending: false })

  if (startDate) {
    query = query.gte('check_in', startDate)
  }

  if (endDate) {
    query = query.lte('check_in', endDate)
  }

  if (user_id) {
    query = query.eq('user_id', user_id)
  }

  const { data: attendanceData, error } = await query.limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch user profiles and locations
  if (attendanceData && attendanceData.length > 0) {
    const userIds = [...new Set(attendanceData.map(a => a.user_id))]
    const locationIds = attendanceData.map(a => a.location_id).filter(Boolean) as string[]

    const [usersRes, locationsRes] = await Promise.all([
      supabase.from('user_profiles').select('user_id, full_name, role').in('user_id', userIds),
      locationIds.length > 0
        ? supabase.from('locations').select('id, name, address').in('id', locationIds)
        : Promise.resolve({ data: [] }),
    ])

    // Enrich attendance data
    const enrichedAttendance = attendanceData.map(attendance => {
      const userProfile = usersRes.data?.find(p => p.user_id === attendance.user_id)
      const location = locationsRes.data?.find(loc => loc.id === attendance.location_id)

      // Calculate duration if check_out exists
      let duration_minutes: number | null = null
      if (attendance.check_out) {
        const checkIn = new Date(attendance.check_in)
        const checkOut = new Date(attendance.check_out)
        duration_minutes = Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000)
      }

      return {
        ...attendance,
        user_profile: userProfile || null,
        location: location || null,
        duration_minutes,
      }
    })

    return NextResponse.json(enrichedAttendance)
  }

  return NextResponse.json(attendanceData || [])
}

