import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import CarbonLeaderboard from '../components/CarbonLeaderboard'

const HomePage = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 rounded-lg">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">{t('common.appName')}</h1>
          <p className="text-xl mb-8">{t('home.tagline')}</p>
          <Link
            to="/search"
            className="inline-block px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100"
          >
            {t('search.title')}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">
          {t('home.whyChoose', { appName: t('common.appName') })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-2">{t('home.savePlanet')}</h3>
            <p className="text-gray-600">{t('home.savePlanetDesc')}</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2">{t('home.buildTrust')}</h3>
            <p className="text-gray-600">{t('home.buildTrustDesc')}</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">{t('home.saveMoney')}</h3>
            <p className="text-gray-600">{t('home.saveMoneyDesc')}</p>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center">{t('carbon.communityImpact')}</h2>
        <CarbonLeaderboard />
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 p-12 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">{t('home.readyToStart')}</h2>
        <p className="text-lg text-gray-600 mb-8">{t('home.readyToStartDesc')}</p>
        <Link
          to="/search"
          className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90"
        >
          {t('search.title')}
        </Link>
      </section>
    </div>
  )
}

export default HomePage
