import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import NotificationBell from './NotificationBell'

const Navigation = () => {
  const { t } = useTranslation()
  const { isAuthenticated, logout } = useAuth()
  const { language, changeLanguage } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = (
    <>
      <Link to="/" className="text-gray-700 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
        {t('common.home')}
      </Link>
      <Link to="/search" className="text-gray-700 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
        {t('common.search')}
      </Link>

      {isAuthenticated && (
        <>
          <Link to="/create-listing" className="text-gray-700 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
            {t('listing.create')}
          </Link>
          <Link to="/transactions" className="text-gray-700 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
            {t('transaction.myTransactions')}
          </Link>
          <Link to="/profile" className="text-gray-700 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
            {t('common.profile')}
          </Link>
        </>
      )}
    </>
  )

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">
          {t('common.appName')}
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks}
        </div>

        {/* Right side: notification, language, auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated && <NotificationBell />}

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value as 'en' | 'uk')}
            className="hidden sm:block px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="en">EN</option>
            <option value="uk">UK</option>
          </select>

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="hidden md:block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              {t('common.logout')}
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/login'}
              className="hidden md:block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              {t('common.login')}
            </button>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-3 bg-white">
          <div className="flex flex-col gap-3">
            {navLinks}
          </div>
          <div className="flex items-center gap-3 pt-3 border-t">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value as 'en' | 'uk')}
              className="sm:hidden px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="en">EN</option>
              <option value="uk">UK</option>
            </select>
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false) }}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                {t('common.logout')}
              </button>
            ) : (
              <button
                onClick={() => { window.location.href = '/login'; setMobileMenuOpen(false) }}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                {t('common.login')}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation
