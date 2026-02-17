import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SEO from '../components/SEO'

const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <SEO title="404" />
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{t('error.pageNotFound')}</p>
      <Link
        to="/"
        className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90"
      >
        {t('common.home')}
      </Link>
    </div>
  )
}

export default NotFoundPage
