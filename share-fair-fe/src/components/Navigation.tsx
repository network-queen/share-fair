import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../hooks/useTheme'
import NotificationBell from './NotificationBell'

const Navigation = () => {
  const { t } = useTranslation()
  const { isAuthenticated, logout } = useAuth()
  const { language, changeLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = (
    <>
      <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
        {t('common.home')}
      </Link>
      <Link to="/search" className="text-gray-700 dark:text-gray-200 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
        {t('common.search')}
      </Link>

      {isAuthenticated && (
        <>
          <Link to="/create-listing" className="text-gray-700 dark:text-gray-200 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
            {t('listing.create')}
          </Link>
          <Link to="/transactions" className="text-gray-700 dark:text-gray-200 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
            {t('transaction.myTransactions')}
          </Link>
          <Link to="/messages" className="text-gray-700 dark:text-gray-200 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
            {t('messages.title')}
          </Link>
          <Link to="/profile" className="text-gray-700 dark:text-gray-200 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
            {t('common.profile')}
          </Link>
        </>
      )}
    </>
  )

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md" role="navigation" aria-label={t('common.home')}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary" aria-label={t('common.appName')}>
          {t('common.appName')}
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks}
        </div>

        {/* Right side: notification, theme, language, auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated && <NotificationBell />}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            aria-label={theme === 'dark' ? t('common.lightMode', { defaultValue: 'Light mode' }) : t('common.darkMode', { defaultValue: 'Dark mode' })}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value as 'en' | 'uk')}
            className="hidden sm:block px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md"
            aria-label={t('common.settings', { defaultValue: 'Language' })}
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
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
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
        <div className="md:hidden border-t dark:border-gray-700 px-4 py-4 space-y-3 bg-white dark:bg-gray-800">
          <div className="flex flex-col gap-3">
            {navLinks}
          </div>
          <div className="flex items-center gap-3 pt-3 border-t dark:border-gray-700">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value as 'en' | 'uk')}
              className="sm:hidden px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md"
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
