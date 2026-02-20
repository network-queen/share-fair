import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useLanguage } from './hooks/useLanguage'
import { useTheme } from './hooks/useTheme'

// Pages - Will be created in next iteration
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SearchPage from './pages/SearchPage'
import ListingDetailPage from './pages/ListingDetailPage'
import ProfilePage from './pages/ProfilePage'
import CreateListingPage from './pages/CreateListingPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import AboutPage from './pages/AboutPage'
import MyTransactionsPage from './pages/MyTransactionsPage'
import TransactionDetailPage from './pages/TransactionDetailPage'
import PaymentReturnPage from './pages/PaymentReturnPage'
import EditListingPage from './pages/EditListingPage'
import SustainabilityPage from './pages/SustainabilityPage'
import NotFoundPage from './pages/NotFoundPage'

// Components - Will be created in next iteration
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { initAuth, isAuthenticated } = useAuth()
  const { initLanguage } = useLanguage()
  useTheme()

  useEffect(() => {
    initAuth()
    initLanguage()
  }, [])

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<LoginPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listing/:id/edit"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <EditListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-listing"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CreateListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <MyTransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/:id"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <TransactionDetailPage />
              </ProtectedRoute>
            }
          />

          <Route path="/payment/return" element={<PaymentReturnPage />} />

          {/* Catch all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
