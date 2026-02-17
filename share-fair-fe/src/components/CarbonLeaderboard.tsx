import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import carbonService from '../services/carbonService'
import type { LeaderboardEntry } from '../services/carbonService'

const medals = ['🥇', '🥈', '🥉']

const CarbonLeaderboard = () => {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carbonService.getLeaderboard(10)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-center py-4 text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
  }

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="font-bold text-lg mb-4">{t('carbon.leaderboard')}</h3>
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div key={entry.userId} className="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-b-0">
            <div className="flex items-center gap-3">
              <span className="w-8 text-center font-bold text-lg">
                {index < 3 ? medals[index] : `${index + 1}.`}
              </span>
              <span className="font-medium">{entry.name}</span>
            </div>
            <span className="font-semibold text-green-600">{entry.totalCarbonSaved} kg CO₂</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CarbonLeaderboard
