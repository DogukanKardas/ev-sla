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

  const body = await request.json()
  const { qr_code, location_id, latitude, longitude, distance_meters } = body

  if (!qr_code) {
    return NextResponse.json({ error: 'QR code required' }, { status: 400 })
  }

  // Verify QR code belongs to the user
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, user_id, qr_code')
    .eq('qr_code', qr_code)
    .single()

  if (profileError || !profile || profile.user_id !== user.id) {
    return NextResponse.json({ error: 'Invalid QR code' }, { status: 403 })
  }

  // Check if there's an open attendance (check-in without check-out)
  const { data: openAttendance } = await supabase
    .from('attendance')
    .select('id, check_in')
    .eq('user_id', user.id)
    .is('check_out', null)
    .order('check_in', { ascending: false })
    .limit(1)
    .single()

  if (openAttendance) {
    // Check-out
    const checkOutTime = new Date().toISOString()
    const checkInTime = new Date(openAttendance.check_in)
    const durationMinutes = Math.floor((new Date(checkOutTime).getTime() - checkInTime.getTime()) / 60000)

    const { data, error } = await supabase
      .from('attendance')
      .update({
        check_out: checkOutTime,
      })
      .eq('id', openAttendance.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      type: 'check-out',
      attendance: data,
      duration_minutes: durationMinutes 
    })
  } else {
    // Check-in
    const { data, error } = await supabase
      .from('attendance')
      .insert({
        user_id: user.id,
        check_in: new Date().toISOString(),
        qr_code_used: qr_code,
        location_id: location_id || null,
        latitude: latitude || null,
        longitude: longitude || null,
        distance_meters: distance_meters || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      type: 'check-in',
      attendance: data 
    })
  }
}

