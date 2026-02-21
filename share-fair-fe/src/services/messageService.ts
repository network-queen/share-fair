import api from './api'
import type { Conversation, Message } from '../types'

const messageService = {
  async getConversations(): Promise<Conversation[]> {
    const { data } = await api.get('/messages/conversations')
    return data.data
  },

  async startConversation(receiverId: string, transactionId?: string): Promise<Conversation> {
    const { data } = await api.post('/messages/conversations', { receiverId, transactionId })
    return data.data
  },

  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    const { data } = await api.get(`/messages/conversations/${conversationId}`, {
      params: { limit, offset },
    })
    return data.data
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const { data } = await api.post(`/messages/conversations/${conversationId}`, { content })
    return data.data
  },
}

export default messageService
