import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import notificationPreferenceService from '../services/notificationPreferenceService'
import type { NotificationPreferences as Prefs } from '../services/notificationPreferenceService'

const NotificationPreferences = () => {
  const { t } = useTranslation()
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    notificationPreferenceService.getPreferences()
      .then(setPrefs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (key: keyof Prefs) => {
    if (!prefs) return
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    setSaving(true)
    try {
      await notificationPreferenceService.updatePreferences({ [key]: updated[key] })
    } catch {
      setPrefs(prefs)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-500">{t('common.loading')}</p>
  if (!prefs) return null

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-gray-700">{label}</span>
      <button
        type="button"
        onClick={onChange}
        disabled={saving}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-bold text-lg mb-4">{t('notificationPrefs.title')}</h3>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('notificationPrefs.email')}</h4>
        <div className="divide-y">
          <Toggle label={t('notificationPrefs.emailTransactions')} checked={prefs.emailTransactions} onChange={() => toggle('emailTransactions')} />
          <Toggle label={t('notificationPrefs.emailReviews')} checked={prefs.emailReviews} onChange={() => toggle('emailReviews')} />
          <Toggle label={t('notificationPrefs.emailMarketing')} checked={prefs.emailMarketing} onChange={() => toggle('emailMarketing')} />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('notificationPrefs.inApp')}</h4>
        <div className="divide-y">
          <Toggle label={t('notificationPrefs.inAppTransactions')} checked={prefs.inAppTransactions} onChange={() => toggle('inAppTransactions')} />
          <Toggle label={t('notificationPrefs.inAppReviews')} checked={prefs.inAppReviews} onChange={() => toggle('inAppReviews')} />
        </div>
      </div>
    </div>
  )
}

export default NotificationPreferences
