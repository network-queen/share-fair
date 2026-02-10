import { useTranslation } from 'react-i18next'

const TermsOfServicePage = () => {
  const { t } = useTranslation()

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">{t('terms.title')}</h1>
      <p className="text-gray-500 mb-8">{t('terms.lastUpdated')}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('terms.acceptanceTitle')}</h2>
        <p className="text-gray-700 leading-relaxed">{t('terms.acceptanceText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('terms.eligibilityTitle')}</h2>
        <p className="text-gray-700 leading-relaxed">{t('terms.eligibilityText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('terms.responsibilitiesTitle')}</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>{t('terms.responsibilitiesAccuracy')}</li>
          <li>{t('terms.responsibilitiesSafety')}</li>
          <li>{t('terms.responsibilitiesConduct')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('terms.rentalsTitle')}</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>{t('terms.rentalsLiability')}</li>
          <li>{t('terms.rentalsTerms')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('terms.prohibitedTitle')}</h2>
        <p className="text-gray-700 leading-relaxed">{t('terms.prohibitedText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('terms.environmentTitle')}</h2>
        <p className="text-gray-700 leading-relaxed">{t('terms.environmentText')}</p>
      </section>
    </div>
  )
}

export default TermsOfServicePage
