import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateQRCodeString } from '@/lib/qr/generator'

export async function GET() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(profile)
}

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
  const { user_id, full_name, role } = body

  if (!user_id || !full_name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const qrCode = generateQRCodeString(user_id)

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id,
      full_name,
      role,
      qr_code: qrCode,
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
  const { full_name, role } = body

  // Check if user is admin or updating their own profile
  const { data: currentProfile } = await supabase
    .from('user_profiles')
    .select('role, user_id')
    .eq('user_id', user.id)
    .single()

  if (!currentProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Only admin can change roles
  if (role && role !== currentProfile.role && currentProfile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updateData: any = {}
  if (full_name) updateData.full_name = full_name
  if (role && currentProfile.role === 'admin') updateData.role = role

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

