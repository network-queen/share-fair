import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import type { NotificationItem } from '../types'

const WS_URL = (import.meta.env.VITE_API_BASE_URL || 'https://localhost/api/v1')
  .replace(/\/api\/v1$/, '')
  .replace(/^https?:\/\//, (match) => (match === 'https://' ? 'wss://' : 'ws://'))
  + '/ws'

interface Options {
  token: string | null
  onNotification: (notification: NotificationItem) => void
}

export function useRealtimeNotifications({ token, onNotification }: Options) {
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!token) return

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (message) => {
          try {
            const notification: NotificationItem = JSON.parse(message.body)
            onNotification(notification)
          } catch {
            // ignore malformed messages
          }
        })
      },
      onStompError: () => {
        // connection errors are silent — polling fallback remains active
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  return clientRef
}
