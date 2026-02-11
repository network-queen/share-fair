import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAppDispatch } from '../hooks/redux'
import { updateUser } from '../store/slices/authSlice'
import userService from '../services/userService'
import transactionService from '../services/transactionService'
import type { TransactionResponse } from '../services/transactionService'
import type { Listing } from '../types'

const ProfilePage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const dispatch = useAppDispatch()

  const [activeTab, setActiveTab] = useState<'listings' | 'transactions'>('listings')
  const [listings, setListings] = useState<Listing[]>([])
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [loadingListings, setLoadingListings] = useState(false)
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  // Inline edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editNeighborhood, setEditNeighborhood] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      loadListings()
      loadTransactions()
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

  const startEditing = () => {
    if (!user) return
    setEditName(user.name || '')
    setEditNeighborhood(user.neighborhood || '')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      await dispatch(updateUser({ id: user.id, data: { name: editName, neighborhood: editNeighborhood } })).unwrap()
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
      {/* User Header */}
      <div className="bg-white rounded-lg shadow p-6 flex items-center gap-6">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold">
            {initials}
          </div>
        )}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('profile.name')}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('search.neighborhood')}</label>
                <input
                  type="text"
                  value={editNeighborhood}
                  onChange={(e) => setEditNeighborhood(e.target.value)}
                  className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">{user.neighborhood}</p>
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
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-3 font-semibold ${activeTab === 'listings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t('profile.myListings')} ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-semibold ${activeTab === 'transactions' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t('profile.myTransactions')} ({transactions.length})
          </button>
        </div>

        {activeTab === 'listings' && (
          <div>
            {loadingListings ? (
              <p className="text-center py-4 text-gray-500">{t('common.loading')}</p>
            ) : listings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">{t('profile.noListings')}</p>
                <Link to="/create-listing" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  {t('listing.create')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Link key={listing.id} to={`/listing/${listing.id}`} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                    <div className="aspect-video bg-gray-200">
                      {listing.images?.[0] && (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{listing.title}</h3>
                      <p className="text-primary font-bold">${listing.pricePerDay || listing.price}/{t('transaction.day')}</p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${listing.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
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
              <p className="text-center py-4 text-gray-500">{t('common.loading')}</p>
            ) : transactions.length === 0 ? (
              <p className="text-center py-8 text-gray-500">{t('profile.noTransactions')}</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <Link
                    key={tx.id}
                    to={`/transactions/${tx.id}`}
                    className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{tx.listingTitle || t('transaction.rental')}</h3>
                        <p className="text-sm text-gray-500">
                          {tx.startDate} - {tx.endDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${tx.totalAmount}</p>
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
      </div>
    </div>
  )
}

export default ProfilePage
