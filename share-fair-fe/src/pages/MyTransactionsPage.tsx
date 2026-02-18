import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { useAuth } from '../hooks/useAuth'
import { fetchMyTransactions } from '../store/slices/transactionSlice'
import SEO from '../components/SEO'
import { getStatusColor } from '../utils/transactionUtils'

const MyTransactionsPage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { transactions, isLoading, error } = useAppSelector((state) => state.transaction)

  useEffect(() => {
    dispatch(fetchMyTransactions())
  }, [dispatch])

  if (isLoading) {
    return <p className="text-center py-8">{t('common.loading')}</p>
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 px-4 py-3 rounded">
        {t('common.error')}: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SEO title={t('transaction.myTransactions')} />
      <h1 className="text-3xl font-bold">{t('transaction.myTransactions')}</h1>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('transaction.noTransactions')}</p>
          <Link to="/search" className="mt-4 inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
            {t('transaction.browseListings')}
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{t('transaction.listing')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{t('transaction.role')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{t('transaction.dates')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{t('transaction.amount')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">{t('transaction.statusLabel')}</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {transactions.map((tx) => {
                const isOwner = user?.id === tx.ownerId
                return (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <Link to={`/transactions/${tx.id}`} className="text-primary hover:underline font-medium">
                        {tx.listingTitle}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {isOwner ? t('transaction.owner') : t('transaction.borrower')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {tx.startDate} - {tx.endDate}
                    </td>
                    <td className="px-6 py-4 font-semibold">${tx.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(tx.status)}`}>
                        {t(`transaction.status.${tx.status}`)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MyTransactionsPage
