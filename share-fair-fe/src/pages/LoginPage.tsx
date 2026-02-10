import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useSearchParams, useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const { t } = useTranslation()
  const { login, handleOAuthCallback, isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
      return
    }

    // Handle OAuth callback
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const provider = searchParams.get('provider')

    if (code && state && provider) {
      handleOAuthCallback(code, provider, state)
    }
  }, [isAuthenticated, navigate, searchParams, handleOAuthCallback])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">{t('auth.loginTitle')}</h1>
        <p className="text-gray-600 text-center mb-8">{t('auth.loginSubtitle')}</p>

        <div className="space-y-4">
          <button
            onClick={() => login('google')}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
          >
            <span>🔵</span>
            {t('auth.loginWithGoogle')}
          </button>

          <button
            onClick={() => login('facebook')}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
          >
            <span>👍</span>
            {t('auth.loginWithFacebook')}
          </button>

          <button
            onClick={() => login('github')}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
          >
            <span>🐱</span>
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
