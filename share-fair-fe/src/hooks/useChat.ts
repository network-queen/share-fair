import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import type { Message } from '../types'

const WS_URL = (import.meta.env.VITE_API_BASE_URL || 'https://localhost/api/v1')
  .replace(/\/api\/v1$/, '')
  .replace(/^https?:\/\//, (match) => (match === 'https://' ? 'wss://' : 'ws://'))
  + '/ws'

interface Options {
  token: string | null
  onMessage: (message: Message) => void
}

export function useChat({ token, onMessage }: Options) {
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
        client.subscribe('/user/queue/chat', (frame) => {
          try {
            const message: Message = JSON.parse(frame.body)
            onMessage(message)
          } catch {
            // ignore malformed messages
          }
        })
      },
      onStompError: () => {
        // silent — REST fallback remains active
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const sendViaWs = (conversationId: string, content: string) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ conversationId, content }),
      })
      return true
    }
    return false
  }

  return { sendViaWs, clientRef }
}
