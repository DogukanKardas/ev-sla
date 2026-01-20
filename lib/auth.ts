import { createClient } from './supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types/database'

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !profile) {
    // Profile doesn't exist, redirect to setup page
    redirect('/profile-setup')
  }

  return profile
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await getUserProfile()

  if (!allowedRoles.includes(profile.role)) {
    redirect('/dashboard')
  }

  return profile
}

export async function isAdmin() {
  const profile = await getUserProfile()
  return profile.role === 'admin'
}

export async function isManager() {
  const profile = await getUserProfile()
  return profile.role === 'admin' || profile.role === 'manager'
}

