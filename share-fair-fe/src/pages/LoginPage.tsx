import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useSearchParams, useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const { t } = useTranslation()
  const { login, handleOAuthCallback, isAuthenticated, error } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
      return
    }

    // Handle OAuth callback
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (code && state && !isProcessing) {
      // Derive provider from stored state in localStorage
      const providers = ['google', 'facebook', 'github'] as const
      const provider = providers.find(p => localStorage.getItem(`oauth_state_${p}`) === state)

      if (provider) {
        localStorage.removeItem(`oauth_state_${provider}`)
        setIsProcessing(true)
        handleOAuthCallback(code, provider)
      }
    }
  }, [isAuthenticated, navigate, searchParams, handleOAuthCallback, isProcessing])

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">{t('auth.loginTitle')}</h1>
        <p className="text-gray-600 text-center mb-8">{t('auth.loginSubtitle')}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => login('google')}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
          >
            {t('auth.loginWithGoogle')}
          </button>

          <button
            onClick={() => login('facebook')}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
          >
            {t('auth.loginWithFacebook')}
          </button>

          <button
            onClick={() => login('github')}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
          >
            {t('auth.loginWithGithub')}
          </button>
        </div>

        <p className="text-sm text-gray-500 text-center mt-8">
          By logging in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default LoginPage
