import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle Teams webhook validation
    if (body.validationToken) {
      return NextResponse.text(body.validationToken, { status: 200 })
    }

    // Handle Teams notifications
    if (body.value) {
      for (const notification of body.value) {
        if (notification.resource === 'messages') {
          // Fetch message details from Teams API
          // This requires Teams API call with proper authentication
          const resourceUrl = notification.resourceData?.id

          // TODO: Implement Teams API call to get message details
          // Then save to database similar to Slack

          console.log('Teams message notification:', notification)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Teams webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

