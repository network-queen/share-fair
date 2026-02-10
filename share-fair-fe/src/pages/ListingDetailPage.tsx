import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchListing } from '../store/slices/listingSlice'

const ListingDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { currentListing, isLoading, error } = useAppSelector((state) => state.listing)

  useEffect(() => {
    if (id) {
      dispatch(fetchListing(id))
    }
  }, [id, dispatch])

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

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Image Gallery */}
      <div>
        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
          {currentListing.images[0] && (
            <img
              src={currentListing.images[0]}
              alt={currentListing.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        {/* Thumbnails */}
        <div className="grid grid-cols-4 gap-4">
          {currentListing.images.map((image, index) => (
            <div key={index} className="aspect-square bg-gray-200 rounded">
              <img src={image} alt={`${currentListing.title} ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
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
              <p className="text-sm text-gray-600">Trust Score: {currentListing.owner.trustScore}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button className="w-full px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">
            {t('listing.rent')}
          </button>
          <button className="w-full px-6 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary/5">
            {t('listing.contact')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ListingDetailPage
