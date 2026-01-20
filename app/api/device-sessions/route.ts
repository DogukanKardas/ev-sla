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
  const { device_info } = body

  const { data, error } = await supabase
    .from('device_sessions')
    .insert({
      user_id: user.id,
      device_info: device_info || navigator.userAgent,
      opened_at: new Date().toISOString(),
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
  const { session_id } = body

  if (!session_id) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  const closedAt = new Date().toISOString()

  // Get opened_at to calculate duration
  const { data: session } = await supabase
    .from('device_sessions')
    .select('opened_at')
    .eq('id', session_id)
    .eq('user_id', user.id)
    .single()

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const openedAt = new Date(session.opened_at)
  const closedAtDate = new Date(closedAt)
  const durationMinutes = Math.floor((closedAtDate.getTime() - openedAt.getTime()) / 60000)

  const { data, error } = await supabase
    .from('device_sessions')
    .update({
      closed_at: closedAt,
      duration_minutes: durationMinutes,
    })
    .eq('id', session_id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function GET() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('device_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('opened_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

