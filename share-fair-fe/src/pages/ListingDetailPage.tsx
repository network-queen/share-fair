import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { useAuth } from '../hooks/useAuth'
import { fetchListing } from '../store/slices/listingSlice'
import { createTransaction } from '../store/slices/transactionSlice'
import ListingMap from '../components/ListingMap'

const ListingDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { currentListing, isLoading, error } = useAppSelector((state) => state.listing)

  const [showRentForm, setShowRentForm] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rentError, setRentError] = useState('')
  const [renting, setRenting] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchListing(id))
    }
  }, [id, dispatch])

  const handleRent = async () => {
    if (!startDate || !endDate) {
      setRentError(t('transaction.datesRequired'))
      return
    }
    if (endDate < startDate) {
      setRentError(t('transaction.endAfterStart'))
      return
    }
    setRentError('')
    setRenting(true)
    try {
      const result = await dispatch(createTransaction({
        listingId: currentListing!.id,
        startDate,
        endDate,
      })).unwrap()
      navigate(`/transactions/${result.id}`)
    } catch (err: any) {
      setRentError(err || t('common.error'))
    } finally {
      setRenting(false)
    }
  }

  if (isLoading) {
    return <p className="text-center py-8">{t('common.loading')}</p>
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {t('common.error')}: {error}
      </div>
    )
  }

  if (!currentListing) {
    return <p className="text-center py-8">{t('search.noResults')}</p>
  }

  const isOwner = user?.id === currentListing.ownerId

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image Gallery */}
      <div>
        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
          {currentListing.images?.[0] && (
            <img
              src={currentListing.images[0]}
              alt={currentListing.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        {currentListing.images?.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {currentListing.images.map((image, index) => (
              <div key={index} className="aspect-square bg-gray-200 rounded">
                <img src={image} alt={`${currentListing.title} ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">{currentListing.title}</h1>
          <p className="text-gray-600">{currentListing.neighborhood}</p>
        </div>

        <div className="border-t border-b py-4">
          <p className="text-3xl font-bold text-primary">${currentListing.price}</p>
          {currentListing.pricePerDay && (
            <p className="text-gray-600">${currentListing.pricePerDay} {t('listing.pricePerDay')}</p>
          )}
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2">{t('listing.description')}</h3>
          <p className="text-gray-700">{currentListing.description}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">{t('listing.owner')}</h3>
          {currentListing.owner && (
            <div>
              <p className="font-semibold">{currentListing.owner.name}</p>
              <p className="text-sm text-gray-600">{t('profile.trustScore')}: {currentListing.owner.trustScore}</p>
            </div>
          )}
        </div>

        {/* Location Map */}
        {currentListing.latitude && currentListing.longitude &&
         (currentListing.latitude !== 0 || currentListing.longitude !== 0) && (
          <div>
            <h3 className="font-bold text-lg mb-2">{t('listing.location')}</h3>
            <ListingMap listings={[currentListing]} className="h-[250px]" />
          </div>
        )}

        {/* Rent Flow */}
        {isAuthenticated && !isOwner && (
          <div className="space-y-3">
            {!showRentForm ? (
              <button
                onClick={() => setShowRentForm(true)}
                className="w-full px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90"
              >
                {t('listing.rent')}
              </button>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-bold">{t('transaction.selectDates')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t('transaction.startDate')}</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t('transaction.endDate')}</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                {rentError && <p className="text-red-600 text-sm">{rentError}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={handleRent}
                    disabled={renting}
                    className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {renting ? t('common.loading') : t('transaction.confirmRent')}
                  </button>
                  <button
                    onClick={() => { setShowRentForm(false); setRentError('') }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!isAuthenticated && (
          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90"
          >
            {t('transaction.loginToRent')}
          </button>
        )}
      </div>
    </div>
  )
}

export default ListingDetailPage
