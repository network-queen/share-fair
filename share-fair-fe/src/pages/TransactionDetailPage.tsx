import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { useAuth } from '../hooks/useAuth'
import { fetchTransaction, updateTransactionStatus } from '../store/slices/transactionSlice'
import PaymentForm from '../components/PaymentForm'

const TransactionDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentTransaction, isLoading, error } = useAppSelector((state) => state.transaction)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  useEffect(() => {
    if (id) {
      dispatch(fetchTransaction(id))
    }
  }, [id, dispatch])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return
    try {
      await dispatch(updateTransactionStatus({ id, status: newStatus })).unwrap()
    } catch {
      // error handled by slice
    }
  }

  if (isLoading) {
    return <p className="text-center py-8">{t('common.loading')}</p>
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {t('common.error')}: {error}
      </div>
    )
  }

  if (!currentTransaction) {
    return <p className="text-center py-8">{t('transaction.notFound')}</p>
  }

  const tx = currentTransaction
  const isOwner = user?.id === tx.ownerId
  const isBorrower = user?.id === tx.borrowerId

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ACTIVE': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      case 'DISPUTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-primary hover:underline">
        {t('common.back')}
      </button>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{tx.listingTitle}</h1>
            <Link to={`/listing/${tx.listingId}`} className="text-sm text-primary hover:underline">
              {t('transaction.viewListing')}
            </Link>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(tx.status)}`}>
            {t(`transaction.status.${tx.status}`)}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-6 border-t pt-6">
          <div>
            <p className="text-sm text-gray-500">{t('transaction.owner')}</p>
            <p className="font-semibold">{tx.ownerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('transaction.borrower')}</p>
            <p className="font-semibold">{tx.borrowerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('transaction.startDate')}</p>
            <p className="font-semibold">{tx.startDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('transaction.endDate')}</p>
            <p className="font-semibold">{tx.endDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('transaction.totalAmount')}</p>
            <p className="font-semibold text-lg">${tx.totalAmount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('transaction.serviceFee')}</p>
            <p className="font-semibold">${tx.serviceFee}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('transaction.paymentStatus')}</p>
            <p className="font-semibold">{tx.paymentStatus}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('transaction.createdAt')}</p>
            <p className="font-semibold">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}</p>
          </div>
          {tx.completedAt && (
            <div>
              <p className="text-sm text-gray-500">{t('transaction.completedAt')}</p>
              <p className="font-semibold">{new Date(tx.completedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Payment Section */}
        {tx.status === 'PENDING' && isBorrower && !showPayment && (
          <div className="border-t pt-6">
            <button
              onClick={() => setShowPayment(true)}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              {t('payment.payNow')}
            </button>
          </div>
        )}

        {showPayment && id && (
          <div className="border-t pt-6 space-y-3">
            {paymentError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {paymentError}
              </div>
            )}
            <PaymentForm
              transactionId={id}
              onSuccess={() => {
                setShowPayment(false)
                dispatch(fetchTransaction(id))
              }}
              onError={(msg) => setPaymentError(msg)}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t pt-6 flex gap-3">
          {tx.status === 'PENDING' && isOwner && (
            <button
              onClick={() => handleStatusUpdate('ACTIVE')}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
            >
              {t('transaction.accept')}
            </button>
          )}
          {tx.status === 'PENDING' && (
            <button
              onClick={() => handleStatusUpdate('CANCELLED')}
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
            >
              {t('transaction.cancel')}
            </button>
          )}
          {tx.status === 'ACTIVE' && (
            <>
              <button
                onClick={() => handleStatusUpdate('COMPLETED')}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                {t('transaction.complete')}
              </button>
              <button
                onClick={() => handleStatusUpdate('DISPUTED')}
                className="px-6 py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200"
              >
                {t('transaction.dispute')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionDetailPage
