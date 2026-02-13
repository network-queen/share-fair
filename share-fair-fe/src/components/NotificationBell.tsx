import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import notificationService from '../services/notificationService'
import type { NotificationItem } from '../types'

const NotificationBell = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchUnreadCount = () => {
    notificationService.getUnreadCount()
      .then(setUnreadCount)
      .catch(() => {})
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = async () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setLoading(true)
      try {
        const data = await notificationService.getNotifications(10)
        setNotifications(data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
  }

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead()
    setUnreadCount(0)
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id)
      setUnreadCount((c) => Math.max(0, c - 1))
      setNotifications(notifications.map((n) =>
        n.id === notification.id ? { ...n, isRead: true } : n
      ))
    }
    setIsOpen(false)
    if (notification.referenceType === 'TRANSACTION' && notification.referenceId) {
      navigate(`/transactions/${notification.referenceId}`)
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return t('notification.justNow')
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900"
        aria-label={t('notification.notifications')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold">{t('notification.notifications')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline"
              >
                {t('notification.markAllRead')}
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-72">
            {loading && (
              <p className="text-center py-4 text-gray-500 text-sm">{t('common.loading')}</p>
            )}

            {!loading && notifications.length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm">{t('notification.noNotifications')}</p>
            )}

            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                    {timeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
