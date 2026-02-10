import { useTranslation } from 'react-i18next'

const AboutPage = () => {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">{t('about.title')}</h1>

      <img
        src="/circular_economy.jpeg"
        alt="Circular Economy"
        className="w-full object-cover rounded-lg mb-10"
      />

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">{t('about.storyTitle')}</h2>
        <p className="text-gray-700 leading-relaxed text-lg">{t('about.storyText')}</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">{t('about.missionTitle')}</h2>
        <p className="text-gray-700 leading-relaxed text-lg">{t('about.missionText')}</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">{t('about.whatWeDoTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-700 mb-2">{t('about.connectTitle')}</h3>
            <p className="text-gray-700">{t('about.connectText')}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">{t('about.trackTitle')}</h3>
            <p className="text-gray-700">{t('about.trackText')}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-700 mb-2">{t('about.trustTitle')}</h3>
            <p className="text-gray-700">{t('about.trustText')}</p>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-white">
        <h2 className="text-2xl font-semibold mb-3">{t('about.whyTitle')}</h2>
        <p className="leading-relaxed text-lg">{t('about.whyText')}</p>
      </section>
    </div>
  )
}

export default AboutPage
