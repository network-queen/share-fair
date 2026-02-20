import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import sustainabilityService, { type SustainabilityReport } from '../services/sustainabilityService'
import SEO from '../components/SEO'

const MEDALS = ['🥇', '🥈', '🥉']

export default function SustainabilityPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [report, setReport] = useState<SustainabilityReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'community' | 'personal'>('community')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        if (view === 'personal' && user) {
          setReport(await sustainabilityService.getUserReport(user.id))
        } else {
          setReport(await sustainabilityService.getCommunityReport())
        }
      } catch {
        setReport(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [view, user])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SEO title={t('sustainability.title')} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">🌿 {t('sustainability.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('sustainability.subtitle')}</p>
        </div>
        {user && (
          <div className="flex gap-2">
            {(['community', 'personal'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  view === v
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                }`}
              >
                {t(`sustainability.view.${v}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <p className="text-center py-12 text-gray-500">{t('common.loading')}</p>}

      {!loading && !report && (
        <p className="text-center py-12 text-gray-500">{t('common.error')}</p>
      )}

      {!loading && report && (
        <>
          {/* Personal stats banner */}
          {view === 'personal' && report.userTotalCarbonSavedKg !== null && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex flex-wrap gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {report.userTotalCarbonSavedKg?.toFixed(1)} kg
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('carbon.saved')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {report.userCompletedTransactions}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('trust.transactions')}</p>
              </div>
              {report.userRank && (
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                    #{report.userRank}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('sustainability.rank')}</p>
                </div>
              )}
              {report.userTier && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{report.userTier}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.trustScore')}</p>
                </div>
              )}
            </div>
          )}

          {/* Community stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: `${Number(report.totalCarbonSavedKg).toFixed(0)} kg`, label: t('sustainability.totalCarbonSaved') },
              { value: report.totalCompletedTransactions, label: t('sustainability.totalTransactions') },
              { value: report.totalActiveUsers, label: t('sustainability.activeUsers') },
              { value: `${Number(report.avgCarbonPerTransaction).toFixed(1)} kg`, label: t('sustainability.avgPerTransaction') },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Monthly trend */}
          {report.monthlyTrend.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-lg font-bold mb-4">{t('sustainability.monthlyTrend')}</h2>
              <div className="flex items-end gap-2 h-32">
                {report.monthlyTrend.map((m) => {
                  const max = Math.max(...report.monthlyTrend.map((x) => Number(x.carbonSaved)))
                  const pct = max > 0 ? (Number(m.carbonSaved) / max) * 100 : 0
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500">{Number(m.carbonSaved).toFixed(0)}</span>
                      <div
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${Math.max(pct, 4)}%` }}
                      />
                      <span className="text-xs text-gray-500">{m.month.slice(5)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Carbon by category */}
            {report.carbonByCategory.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-lg font-bold mb-4">{t('sustainability.byCategory')}</h2>
                <div className="space-y-3">
                  {report.carbonByCategory.map((c) => {
                    const max = Math.max(...report.carbonByCategory.map((x) => Number(x.totalCarbon)))
                    const pct = max > 0 ? (Number(c.totalCarbon) / max) * 100 : 0
                    return (
                      <div key={c.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{c.category}</span>
                          <span className="text-gray-500">{Number(c.totalCarbon).toFixed(1)} kg</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Top contributors */}
            {report.topContributors.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-lg font-bold mb-4">{t('sustainability.topContributors')}</h2>
                <div className="space-y-3">
                  {report.topContributors.map((c, i) => (
                    <div key={c.userId} className="flex items-center gap-3">
                      <span className="text-xl w-7 text-center">{MEDALS[i] || `#${i + 1}`}</span>
                      <img
                        src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}`}
                        alt={c.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.transactionCount} {t('trust.transactions')}</p>
                      </div>
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                        {Number(c.totalCarbon).toFixed(1)} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
