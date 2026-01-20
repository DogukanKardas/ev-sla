import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle WhatsApp webhook verification
    if (body['hub.mode'] === 'subscribe' && body['hub.verify_token']) {
      const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
      if (body['hub.verify_token'] === verifyToken) {
        return new Response(body['hub.challenge'], { status: 200 })
      }
      return NextResponse.json({ error: 'Invalid verify token' }, { status: 403 })
    }

    // Handle WhatsApp messages
    if (body.entry) {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.value?.messages) {
              for (const message of change.value.messages) {
                // Extract message data
                const from = message.from
                const messageId = message.id
                const timestamp = message.timestamp
                const text = message.text?.body || ''

                // Find user by phone number mapping
                // TODO: Implement phone number to user_id mapping
                // const { data: userMapping } = await supabase
                //   .from('whatsapp_user_mappings')
                //   .select('user_id')
                //   .eq('phone_number', from)
                //   .single()

                console.log('WhatsApp message received:', {
                  from,
                  messageId,
                  text,
                  timestamp,
                })

                // Save message to database
                // This would require the user_id mapping
                // await supabase.from('messages').insert({
                //   user_id: userMapping.user_id,
                //   platform: 'whatsapp',
                //   message_id: messageId,
                //   content: text,
                //   received_at: new Date(parseInt(timestamp) * 1000).toISOString(),
                //   ...
                // })
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

