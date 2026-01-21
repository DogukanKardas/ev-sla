import { createClient } from './client'

export function subscribeToTable(
  table: string,
  callback: (payload: any) => void
) {
  const supabase = createClient()

  const channel = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
      },
      callback
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToUserData(
  userId: string,
  table: string,
  callback: (payload: any) => void
) {
  const supabase = createClient()

  const channel = supabase
    .channel(`user:${userId}:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

