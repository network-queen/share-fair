import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

const ProfilePage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  if (!user) {
    return <p className="text-center py-8">{t('common.loading')}</p>
  }

  return (
    <div className="space-y-8">
      {/* User Header */}
      <div className="bg-white rounded-lg shadow p-6 flex items-center gap-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
          👤
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">{user.neighborhood}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 rounded-lg">
          <p className="text-sm opacity-90">{t('profile.trustScore')}</p>
          <p className="text-4xl font-bold">{user.trustScore}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <p className="text-sm opacity-90">{t('profile.carbonSaved')}</p>
          <p className="text-4xl font-bold">{user.carbonSaved} kg</p>
        </div>
        <div className="bg-gradient-to-br from-accent to-accent/80 text-white p-6 rounded-lg">
          <p className="text-sm opacity-90">Verification Status</p>
          <p className="text-lg font-bold">{user.verificationStatus}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{t('profile.myListings')}</h2>
        <p className="text-gray-500">Your listings will appear here</p>
      </div>
    </div>
  )
}

export default ProfilePage
