import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useChat } from '../hooks/useChat'
import messageService from '../services/messageService'
import SEO from '../components/SEO'
import type { Conversation, Message } from '../types'

const MessagesPage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const token = localStorage.getItem('accessToken')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { sendViaWs } = useChat({
    token,
    onMessage: (msg) => {
      if (activeConversation && msg.conversationId === activeConversation.id) {
        setMessages((prev) => [...prev, msg])
      }
      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt }
            : c
        )
      )
    },
  })

  useEffect(() => {
    messageService.getConversations()
      .then(setConversations)
      .catch(() => {})
      .finally(() => setLoadingConversations(false))
  }, [])

  useEffect(() => {
    if (!activeConversation) return
    setLoadingMessages(true)
    messageService.getMessages(activeConversation.id)
      .then((msgs) => setMessages([...msgs].reverse()))
      .catch(() => {})
      .finally(() => setLoadingMessages(false))
  }, [activeConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!activeConversation || !newMessage.trim()) return
    const content = newMessage.trim()
    setNewMessage('')
    setSending(true)
    try {
      const sent = sendViaWs(activeConversation.id, content)
      if (!sent) {
        // REST fallback
        const msg = await messageService.sendMessage(activeConversation.id, content)
        setMessages((prev) => [...prev, msg])
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id ? { ...c, lastMessage: content } : c
        )
      )
    } catch {
      setNewMessage(content)
    } finally {
      setSending(false)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return t('notification.justNow')
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  }

  return (
    <div className="max-w-5xl mx-auto">
      <SEO title={t('messages.title')} />
      <h1 className="text-2xl font-bold mb-6">{t('messages.title')}</h1>

      <div className="flex gap-0 border dark:border-gray-700 rounded-lg overflow-hidden" style={{ height: '70vh' }}>
        {/* Conversation list */}
        <div className="w-72 border-r dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
          <div className="p-4 border-b dark:border-gray-700 font-semibold text-sm text-gray-500 dark:text-gray-400">
            {t('messages.conversations')}
          </div>
          <div className="overflow-y-auto flex-1">
            {loadingConversations ? (
              <p className="text-center py-8 text-gray-400 text-sm">{t('common.loading')}</p>
            ) : conversations.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">{t('messages.noConversations')}</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    activeConversation?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {conv.otherUserAvatar ? (
                      <img src={conv.otherUserAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {conv.otherUserName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{conv.otherUserName}</span>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-gray-400 ml-1 shrink-0">{timeAgo(conv.lastMessageAt)}</span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {activeConversation.otherUserName.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold">{activeConversation.otherUserName}</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <p className="text-center py-8 text-gray-400 text-sm">{t('common.loading')}</p>
                ) : messages.length === 0 ? (
                  <p className="text-center py-8 text-gray-400 text-sm">{t('messages.noMessages')}</p>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === user?.id
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                            isOwn
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                            {timeAgo(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder={t('messages.inputPlaceholder')}
                    className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {t('messages.send')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 dark:text-gray-500">{t('messages.selectConversation')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessagesPage
