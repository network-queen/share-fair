import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'

const Navigation = () => {
  const { t } = useTranslation()
  const { isAuthenticated, logout } = useAuth()
  const { language, changeLanguage } = useLanguage()

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">
          {t('common.appName')}
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-700 hover:text-primary">
            {t('common.home')}
          </Link>
          <Link to="/search" className="text-gray-700 hover:text-primary">
            {t('common.search')}
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/create-listing" className="text-gray-700 hover:text-primary">
                {t('listing.create')}
              </Link>
              <Link to="/transactions" className="text-gray-700 hover:text-primary">
                {t('transaction.myTransactions')}
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-primary">
                {t('common.profile')}
              </Link>
            </>
          )}
        </div>

        {/* Auth & Language */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value as 'en' | 'uk')}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="en">English</option>
            <option value="uk">Українська</option>
          </select>

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              {t('common.logout')}
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              {t('common.login')}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
