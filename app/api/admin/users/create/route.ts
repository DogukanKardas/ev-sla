import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateQRCodeString } from '@/lib/qr/generator'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { email, password, full_name, role } = body

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Create auth user using service role
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'User creation failed' }, { status: 500 })
  }

  // Create user profile
  const qrCode = generateQRCodeString(authData.user.id)

  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      user_id: authData.user.id,
      full_name,
      role,
      qr_code: qrCode,
    })
    .select()
    .single()

  if (profileError) {
    // Rollback: delete auth user if profile creation fails
    await serviceSupabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({
    user: authData.user,
    profile: profileData,
  })
}

function createClient(url: string, key: string) {
  const { createClient: create } = require('@supabase/supabase-js')
  return create(url, key)
}

