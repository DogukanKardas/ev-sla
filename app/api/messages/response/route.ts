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
  const { message_id } = body

  if (!message_id) {
    return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
  }

  // Get the original message
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .select('*')
    .eq('id', message_id)
    .eq('user_id', user.id)
    .single()

  if (messageError || !message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  // Calculate response time
  const receivedAt = new Date(message.received_at)
  const respondedAt = new Date()
  const responseTimeSeconds = Math.floor((respondedAt.getTime() - receivedAt.getTime()) / 1000)

  // Check if response already exists
  const { data: existingResponse } = await supabase
    .from('message_responses')
    .select('id')
    .eq('message_id', message_id)
    .eq('user_id', user.id)
    .single()

  if (existingResponse) {
    // Update existing response
    const { data, error } = await supabase
      .from('message_responses')
      .update({
        responded_at: respondedAt.toISOString(),
        response_time_seconds: responseTimeSeconds,
      })
      .eq('id', existingResponse.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } else {
    // Create new response
    const { data, error } = await supabase
      .from('message_responses')
      .insert({
        message_id,
        user_id: user.id,
        responded_at: respondedAt.toISOString(),
        response_time_seconds: responseTimeSeconds,
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
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  let query = supabase
    .from('message_responses')
    .select('*, messages(*)')
    .eq('user_id', user.id)
    .order('responded_at', { ascending: false })

  if (startDate) {
    query = query.gte('responded_at', startDate)
  }

  if (endDate) {
    query = query.lte('responded_at', endDate)
  }

  const { data, error } = await query.limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

