import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAppDispatch } from '../hooks/redux'
import { updateUser } from '../store/slices/authSlice'
import userService from '../services/userService'
import transactionService from '../services/transactionService'
import reviewService from '../services/reviewService'
import carbonService from '../services/carbonService'
import trustScoreService from '../services/trustScoreService'
import ReviewList from '../components/ReviewList'
import TrustBadge from '../components/TrustBadge'
import SEO from '../components/SEO'
import type { TransactionResponse } from '../services/transactionService'
import type { ReviewResponse } from '../services/reviewService'
import NotificationPreferences from '../components/NotificationPreferences'
import type { Listing, TrustScore, CarbonSavedRecord } from '../types'

const ProfilePage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const dispatch = useAppDispatch()

  const [activeTab, setActiveTab] = useState<'listings' | 'transactions' | 'reviews' | 'carbon' | 'settings'>('listings')
  const [listings, setListings] = useState<Listing[]>([])
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [carbonHistory, setCarbonHistory] = useState<CarbonSavedRecord[]>([])
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null)
  const [loadingListings, setLoadingListings] = useState(false)
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [loadingCarbon, setLoadingCarbon] = useState(false)

  // Inline edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editNeighborhood, setEditNeighborhood] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadListings()
      loadTransactions()
      loadReviews()
      loadCarbonHistory()
      loadTrustScore()
    }
  }, [user])

  const loadListings = async () => {
    if (!user) return
    setLoadingListings(true)
    try {
      const data = await userService.getUserListings(user.id)
      setListings(data)
    } catch {
      // ignore
    } finally {
      setLoadingListings(false)
    }
  }

  const loadTransactions = async () => {
    setLoadingTransactions(true)
    try {
      const data = await transactionService.getMyTransactions()
      setTransactions(data)
    } catch {
      // ignore
    } finally {
      setLoadingTransactions(false)
    }
  }

  const loadReviews = async () => {
    if (!user) return
    setLoadingReviews(true)
    try {
      const data = await reviewService.getUserReviews(user.id)
      setReviews(data)
    } catch {
      // ignore
    } finally {
      setLoadingReviews(false)
    }
  }

  const loadCarbonHistory = async () => {
    if (!user) return
    setLoadingCarbon(true)
    try {
      const data = await carbonService.getUserHistory(user.id)
      setCarbonHistory(data)
    } catch {
      // ignore
    } finally {
      setLoadingCarbon(false)
    }
  }

  const loadTrustScore = async () => {
    if (!user) return
    try {
      const data = await trustScoreService.getTrustScore(user.id)
      setTrustScore(data)
    } catch {
      // ignore
    }
  }

  const startEditing = () => {
    if (!user) return
    setEditName(user.name || '')
    setEditNeighborhood(user.neighborhood || '')
    setEditAvatar(user.avatar || '')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      await dispatch(updateUser({ id: user.id, data: { name: editName, neighborhood: editNeighborhood, avatar: editAvatar } })).unwrap()
      setIsEditing(false)
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ACTIVE': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      case 'DISPUTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return <p className="text-center py-8">{t('common.loading')}</p>
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="space-y-8">
      <SEO title={t('profile.title')} />
      {/* User Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center gap-6">
        <div className="relative">
          {(isEditing ? editAvatar : user.avatar) ? (
            <img src={isEditing ? editAvatar : user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold">
              {initials}
            </div>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                const url = prompt(t('profile.avatarUrl'))
                if (url !== null) setEditAvatar(url)
              }}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm hover:bg-primary/90 shadow"
              title={t('profile.changeAvatar')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('profile.name')}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('search.neighborhood')}</label>
                <input
                  type="text"
                  value={editNeighborhood}
                  onChange={(e) => setEditNeighborhood(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? t('common.loading') : t('common.save')}
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.neighborhood}</p>
              <button
                onClick={startEditing}
                className="mt-2 text-sm text-primary hover:underline"
              >
                {t('profile.edit')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 rounded-lg">
          <p className="text-sm opacity-90">{t('profile.trustScore')}</p>
          <p className="text-4xl font-bold">{user.trustScore}</p>
          {trustScore && (
            <div className="mt-2">
              <TrustBadge score={trustScore.score} tier={trustScore.tier} size="sm" />
              <p className="text-xs opacity-75 mt-1">
                {trustScore.completedTransactions} {t('trust.transactions')} · {t('trust.averageRating')}: {trustScore.averageRating}
              </p>
            </div>
          )}
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <p className="text-sm opacity-90">{t('profile.carbonSaved')}</p>
          <p className="text-4xl font-bold">{user.carbonSaved} kg</p>
        </div>
        <div className="bg-gradient-to-br from-accent to-accent/80 text-white p-6 rounded-lg">
          <p className="text-sm opacity-90">{t('profile.verificationStatus')}</p>
          <p className="text-lg font-bold">{user.verificationStatus}</p>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-3 font-semibold ${activeTab === 'listings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            {t('profile.myListings')} ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-semibold ${activeTab === 'transactions' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            {t('profile.myTransactions')} ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-semibold ${activeTab === 'reviews' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            {t('review.reviews')} ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('carbon')}
            className={`px-6 py-3 font-semibold ${activeTab === 'carbon' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            {t('carbon.history')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-semibold ${activeTab === 'settings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            {t('common.settings')}
          </button>
        </div>

        {activeTab === 'listings' && (
          <div>
            {loadingListings ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
            ) : listings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t('profile.noListings')}</p>
                <Link to="/create-listing" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  {t('listing.create')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Link key={listing.id} to={`/listing/${listing.id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700">
                      {listing.images?.[0] && (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                      <p className={`font-bold ${listing.listingType === 'FREE' ? 'text-green-600' : 'text-primary'}`}>
                        {listing.listingType === 'FREE' ? t('listing.free') : `$${listing.pricePerDay || listing.price}/${t('transaction.day')}`}
                      </p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${listing.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {listing.available ? t('listing.available') : t('listing.unavailable')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            {loadingTransactions ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
            ) : transactions.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">{t('profile.noTransactions')}</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <Link
                    key={tx.id}
                    to={`/transactions/${tx.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{tx.listingTitle || t('transaction.rental')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {tx.startDate} - {tx.endDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.isFree ? 'text-green-600' : ''}`}>
                          {tx.isFree ? t('listing.free') : `$${tx.totalAmount}`}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded ${getStatusColor(tx.status)}`}>
                          {t(`transaction.status.${tx.status}`)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <ReviewList reviews={reviews} loading={loadingReviews} />
        )}

        {activeTab === 'carbon' && (
          <div>
            {loadingCarbon ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
            ) : carbonHistory.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">{t('carbon.noHistory')}</p>
            ) : (
              <div className="space-y-3">
                {carbonHistory.map((record) => (
                  <div key={record.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-600">
                          {t('carbon.saved')}: {record.carbonSavedKg} kg CO₂
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('carbon.estimated')}: {record.estimatedNewProductCarbon} kg
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <NotificationPreferences />
        )}
      </div>
    </div>
  )
}

export default ProfilePage
