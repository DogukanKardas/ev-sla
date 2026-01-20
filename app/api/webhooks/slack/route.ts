import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify Slack signature (optional but recommended)
    // const signature = request.headers.get('x-slack-signature')
    // if (!verifySlackSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    // Handle different Slack event types
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge })
    }

    if (body.event && body.event.type === 'message') {
      const event = body.event

      // Skip bot messages
      if (event.subtype === 'bot_message' || event.bot_id) {
        return NextResponse.json({ received: true })
      }

      // Find user by email or user ID mapping
      // This requires a mapping table or user lookup
      // For now, we'll need to get user_id from somewhere
      // You might need to create a mapping: Slack user_id -> Supabase user_id

      // Example: Get user by Slack user ID (requires mapping table)
      // For this implementation, we'll need to store Slack user mappings
      const slackUserId = event.user

      // TODO: Implement user mapping lookup
      // const { data: userMapping } = await supabase
      //   .from('slack_user_mappings')
      //   .select('user_id')
      //   .eq('slack_user_id', slackUserId)
      //   .single()

      // For now, return success but log that mapping is needed
      console.log('Slack message received:', {
        user: slackUserId,
        text: event.text,
        channel: event.channel,
        ts: event.ts,
      })

      // Save message to database
      // This would require the user_id mapping
      // await supabase.from('messages').insert({...})

      return NextResponse.json({ received: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Slack webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

