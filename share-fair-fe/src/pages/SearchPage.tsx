import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearch } from '../hooks/useSearch'
import { useGeolocation } from '../hooks/useGeolocation'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { useSavedSearches } from '../hooks/useSavedSearches'
import { Link } from 'react-router-dom'
import ListingMap from '../components/ListingMap'
import ListingCardSkeleton from '../components/ListingCardSkeleton'
import HighlightText from '../components/HighlightText'
import SEO from '../components/SEO'
import type { SearchParams } from '../types'

const SearchPage = () => {
  const { t } = useTranslation()
  const {
    results,
    isLoading,
    error,
    neighborhoods,
    categories,
    total,
    hasMore,
    performSearch,
    loadNextPage,
  } = useSearch()

  const { latitude, longitude, isLoading: geoLoading, error: geoError, requestLocation } = useGeolocation()
  const { recentSearches, addSearch, removeSearch: removeRecent, clearAll: clearRecent } = useRecentSearches()
  const { savedSearches, saveSearch, removeSearch: removeSaved } = useSavedSearches()

  const [query, setQuery] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'price' | 'date'>('relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [activeQuery, setActiveQuery] = useState('')
  const [showRecent, setShowRecent] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  const searchWith = useCallback((overrides: Record<string, string | number | undefined>) => {
    const params = {
      query: query || undefined,
      neighborhood: neighborhood || undefined,
      category: category || undefined,
      sortBy,
      ...overrides,
    }
    performSearch(params)
  }, [query, neighborhood, category, sortBy, performSearch])

  const handleSearch = () => {
    if (query.trim()) addSearch(query.trim())
    setActiveQuery(query)
    setShowRecent(false)
    searchWith({})
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleRecentClick = (q: string) => {
    setQuery(q)
    setActiveQuery(q)
    setShowRecent(false)
    searchWith({ query: q })
  }

  const handleSavedClick = (params: SearchParams) => {
    setQuery(params.query || '')
    setNeighborhood(params.neighborhood || '')
    setCategory(params.category || '')
    setSortBy(params.sortBy || 'relevance')
    setActiveQuery(params.query || '')
    setShowSaved(false)
    performSearch(params)
  }

  const handleSaveCurrentSearch = () => {
    const name = query || `${neighborhood || t('search.allNeighborhoods')} / ${category || t('search.allCategories')}`
    saveSearch(name, { query: query || undefined, neighborhood: neighborhood || undefined, category: category || undefined, sortBy })
  }

  const handleNeighborhoodChange = (value: string) => {
    setNeighborhood(value)
    searchWith({ neighborhood: value || undefined })
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    searchWith({ category: value || undefined })
  }

  const handleSortByChange = (value: 'relevance' | 'distance' | 'price' | 'date') => {
    setSortBy(value)
    if (value === 'distance' && latitude && longitude) {
      searchWith({ sortBy: value, lat: latitude, lng: longitude })
    } else {
      searchWith({ sortBy: value })
    }
  }

  const handleNearMe = () => {
    requestLocation()
  }

  // When geolocation resolves, trigger a distance-sorted search
  useEffect(() => {
    if (latitude && longitude) {
      setSortBy('distance')
      searchWith({ sortBy: 'distance', lat: latitude, lng: longitude, radius: 10 })
    }
  }, [latitude, longitude]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <SEO title={t('search.title')} />
      {/* Sidebar Filters */}
      <aside className="lg:col-span-1 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg h-fit sticky top-4">
        <h3 className="font-bold text-lg mb-4">{t('search.title')}</h3>

        {/* Search Query */}
        <div className="mb-4 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 200)}
            placeholder={t('search.placeholder')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-100"
          />
          {/* Recent Searches Dropdown */}
          {showRecent && recentSearches.length > 0 && !query && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-auto">
              <div className="flex justify-between items-center px-3 py-2 border-b dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('search.recentSearches')}</span>
                <button onClick={clearRecent} className="text-xs text-red-500 hover:underline">{t('search.clearRecent')}</button>
              </div>
              {recentSearches.map((q) => (
                <div key={q} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <button onClick={() => handleRecentClick(q)} className="flex-1 text-left text-sm text-gray-700 dark:text-gray-200 truncate">
                    {q}
                  </button>
                  <button onClick={() => removeRecent(q)} className="ml-2 text-gray-400 dark:text-gray-500 hover:text-red-500 text-xs">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Near Me Button */}
        <div className="mb-4">
          <button
            onClick={handleNearMe}
            disabled={geoLoading}
            className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-100 disabled:opacity-50 text-sm font-medium"
          >
            {geoLoading ? t('common.loading') : t('search.nearMe')}
          </button>
          {geoError && (
            <p className="text-xs text-red-500 mt-1">{t('search.locationError')}</p>
          )}
        </div>

        {/* Neighborhood */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {t('search.neighborhood')}
          </label>
          <select
            value={neighborhood}
            onChange={(e) => handleNeighborhoodChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">{t('search.allNeighborhoods')}</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.name}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {t('search.category')}
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">{t('search.allCategories')}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {t('search.sortBy')}
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value as typeof sortBy)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="relevance">{t('search.relevance')}</option>
            <option value="distance">{t('search.distance')}</option>
            <option value="price">{t('search.price')}</option>
            <option value="date">{t('search.date')}</option>
          </select>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? t('common.loading') : t('search.searchButton')}
        </button>

        {/* Save Search */}
        <button
          onClick={handleSaveCurrentSearch}
          className="w-full mt-2 px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary/5"
        >
          {t('search.saveSearch')}
        </button>

        {/* Results Count */}
        {total > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            {t('search.resultsFound', { count: total })}
          </p>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t('search.savedSearches')} ({savedSearches.length})
              <span className={`transform transition-transform ${showSaved ? 'rotate-180' : ''}`}>&#9660;</span>
            </button>
            {showSaved && (
              <div className="mt-2 space-y-1">
                {savedSearches.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-1">
                    <button onClick={() => handleSavedClick(s.params)} className="text-sm text-primary hover:underline truncate flex-1 text-left">
                      {s.name}
                    </button>
                    <button onClick={() => removeSaved(s.id)} className="ml-2 text-gray-400 dark:text-gray-500 hover:text-red-500 text-xs">
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Results */}
      <div className="lg:col-span-3">
        {/* View Toggle */}
        <div className="flex justify-end mb-4 gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {t('search.listView')}
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 text-sm rounded-md ${viewMode === 'map' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            {t('search.mapView')}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {t('common.error')}: {error}
          </div>
        )}

        {viewMode === 'map' ? (
          <ListingMap
            listings={results}
            userLocation={latitude && longitude ? { lat: latitude, lng: longitude } : null}
          />
        ) : (
          <>
            {!isLoading && results.length === 0 && (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">{t('search.noResults')}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listing/${listing.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700">
                    {listing.images[0] && (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">
                      <HighlightText text={listing.title} highlight={activeQuery} />
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      <HighlightText text={listing.description} highlight={activeQuery} />
                    </p>
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${listing.listingType === 'FREE' ? 'text-green-600' : 'text-primary'}`}>
                        {listing.listingType === 'FREE' ? t('listing.free') : `$${listing.price}`}
                      </span>
                      <div className="text-right">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{listing.neighborhood}</span>
                        {listing.distanceKm != null && (
                          <span className="block text-xs text-gray-400 dark:text-gray-500">
                            {listing.distanceKm.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {isLoading && results.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            )}

            {isLoading && results.length > 0 && <p className="text-center py-8">{t('common.loading')}</p>}

            {hasMore && !isLoading && (
              <div className="text-center py-8">
                <button
                  onClick={loadNextPage}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  {t('search.loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SearchPage
