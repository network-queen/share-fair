import { useTranslation } from 'react-i18next'

const PrivacyPolicyPage = () => {
  const { t } = useTranslation()

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">{t('privacy.title')}</h1>
      <p className="text-gray-500 mb-8">{t('privacy.lastUpdated')}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.introTitle')}</h2>
        <p className="text-gray-700 leading-relaxed">{t('privacy.introText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.dataTitle')}</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>{t('privacy.dataIdentity')}</li>
          <li>{t('privacy.dataContact')}</li>
          <li>{t('privacy.dataLocation')}</li>
          <li>{t('privacy.dataUsage')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.useTitle')}</h2>
        <p className="text-gray-700 mb-2">{t('privacy.useIntro')}</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>{t('privacy.useAccount')}</li>
          <li>{t('privacy.useTransactions')}</li>
          <li>{t('privacy.useImpact')}</li>
          <li>{t('privacy.useTrust')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.sharingTitle')}</h2>
        <p className="text-gray-700 leading-relaxed">{t('privacy.sharingText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.rightsTitle')}</h2>
        <p className="text-gray-700 leading-relaxed">{t('privacy.rightsText')}</p>
      </section>
    </div>
  )
}

export default PrivacyPolicyPage
