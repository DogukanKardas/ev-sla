'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeSubscription(
  table: string,
  callback: () => void
) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      channel = supabase
        .channel(`public:${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          (payload) => {
            console.log(`${table} değişikliği:`, payload)
            callback()
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, callback])
}

