import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearch } from '../hooks/useSearch'
import { Link } from 'react-router-dom'

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

  const [query, setQuery] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [category, setCategory] = useState('')
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'price' | 'date'>('relevance')

  const searchWith = useCallback((overrides: Record<string, string | undefined>) => {
    const params = {
      query: query || undefined,
      neighborhood: neighborhood || undefined,
      category: category || undefined,
      sortBy,
      ...overrides,
    }
    performSearch(params)
  }, [query, neighborhood, category, sortBy, performSearch])

  const handleSearch = () => searchWith({})

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
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
    searchWith({ sortBy: value })
  }

  return (
    <div className="grid grid-cols-4 gap-8">
      {/* Sidebar Filters */}
      <aside className="col-span-1 bg-gray-50 p-6 rounded-lg h-fit sticky top-4">
        <h3 className="font-bold text-lg mb-4">{t('search.title')}</h3>

        {/* Search Query */}
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Neighborhood */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('search.neighborhood')}
          </label>
          <select
            value={neighborhood}
            onChange={(e) => handleNeighborhoodChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('search.category')}
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('search.sortBy')}
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value as typeof sortBy)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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

        {/* Results Count */}
        {total > 0 && (
          <p className="text-sm text-gray-500 mt-3">
            {t('search.resultsFound', { count: total })}
          </p>
        )}
      </aside>

      {/* Results */}
      <div className="col-span-3">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {t('common.error')}: {error}
          </div>
        )}

        {!isLoading && results.length === 0 && (
          <p className="text-center py-8 text-gray-500">{t('search.noResults')}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((listing) => (
            <Link
              key={listing.id}
              to={`/listing/${listing.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="h-48 bg-gray-200">
                {listing.images[0] && (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{listing.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {listing.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">${listing.price}</span>
                  <span className="text-sm text-gray-500">{listing.neighborhood}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {isLoading && <p className="text-center py-8">{t('common.loading')}</p>}

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
      </div>
    </div>
  )
}

export default SearchPage
