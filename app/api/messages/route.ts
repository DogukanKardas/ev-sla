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
  const platform = searchParams.get('platform')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  let query = supabase
    .from('messages')
    .select('*')
    .eq('user_id', user.id)
    .order('received_at', { ascending: false })

  if (platform) {
    query = query.eq('platform', platform)
  }

  if (startDate) {
    query = query.gte('received_at', startDate)
  }

  if (endDate) {
    query = query.lte('received_at', endDate)
  }

  const { data, error } = await query.limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // This endpoint can be called by webhooks (service role) or authenticated users
  const authHeader = request.headers.get('authorization')
  const isServiceRole = authHeader === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`

  if (!isServiceRole) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const body = await request.json()
  const { user_id, platform, message_id, channel_id, sender_id, sender_name, content, received_at } = body

  if (!user_id || !platform || !message_id || !content || !received_at) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      user_id,
      platform,
      message_id,
      channel_id: channel_id || '',
      sender_id: sender_id || '',
      sender_name: sender_name || 'Unknown',
      content,
      received_at,
    })
    .select()
    .single()

  if (error) {
    // Ignore duplicate key errors
    if (error.code === '23505') {
      return NextResponse.json({ message: 'Message already exists' }, { status: 200 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

