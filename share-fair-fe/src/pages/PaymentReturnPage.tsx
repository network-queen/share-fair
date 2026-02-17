import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'

const PaymentReturnPage = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'success' | 'failed' | 'loading'>('loading')

  useEffect(() => {
    const redirectStatus = searchParams.get('redirect_status')
    if (redirectStatus === 'succeeded') {
      setStatus('success')
    } else {
      setStatus('failed')
    }
  }, [searchParams])

  if (status === 'loading') {
    return <p className="text-center py-8">{t('common.loading')}</p>
  }

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <SEO title={status === 'success' ? t('payment.success') : t('payment.failed')} />
      {status === 'success' ? (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">{t('payment.success')}</h1>
          <Link
            to="/transactions"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
          >
            {t('payment.returnToTransaction')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-700 dark:text-red-400">{t('payment.failed')}</h1>
          <Link
            to="/transactions"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
          >
            {t('payment.returnToTransaction')}
          </Link>
        </div>
      )}
    </div>
  )
}

export default PaymentReturnPage
