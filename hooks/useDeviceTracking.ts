'use client'

import { useEffect, useRef } from 'react'

export function useDeviceTracking() {
  const sessionIdRef = useRef<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function trackDeviceOpen() {
      try {
        const deviceInfo = navigator.userAgent
        const response = await fetch('/api/device-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ device_info: deviceInfo }),
        })

        if (response.ok) {
          const data = await response.json()
          sessionIdRef.current = data.id
        }
      } catch (error) {
        console.error('Cihaz takip hatası:', error)
      }
    }

    // Track when component mounts (device opened)
    trackDeviceOpen()

    // Track when user closes the tab/window
    const handleBeforeUnload = async () => {
      if (sessionIdRef.current) {
        try {
          await fetch('/api/device-sessions', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_id: sessionIdRef.current }),
          })
        } catch (error) {
          // Ignore errors on unload
          console.error('Cihaz kapanış takip hatası:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Also track visibility changes (tab switching)
    const handleVisibilityChange = async () => {
      if (document.hidden && sessionIdRef.current) {
        // Tab hidden - could close session
        await handleBeforeUnload()
      } else if (!document.hidden && !sessionIdRef.current) {
        // Tab visible again - open new session
        await trackDeviceOpen()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Close session on unmount
      if (sessionIdRef.current) {
        fetch('/api/device-sessions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: sessionIdRef.current }),
        }).catch(() => {
          // Ignore errors
        })
      }
    }
  }, [])

  return sessionIdRef.current
}

