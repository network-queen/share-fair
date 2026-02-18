import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { useAuth } from '../hooks/useAuth'
import { fetchTransaction, updateTransactionStatus } from '../store/slices/transactionSlice'
import PaymentForm from '../components/PaymentForm'
import ReviewForm from '../components/ReviewForm'
import SEO from '../components/SEO'
import reviewService from '../services/reviewService'
import type { ReviewResponse } from '../services/reviewService'
import { getStatusColor } from '../utils/transactionUtils'

const TransactionDetailPage = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentTransaction, isLoading, error } = useAppSelector((state) => state.transaction)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [existingReview, setExistingReview] = useState<ReviewResponse | null>(null)
  const [reviewChecked, setReviewChecked] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchTransaction(id))
    }
  }, [id, dispatch])

  useEffect(() => {
    if (currentTransaction?.status === 'COMPLETED' && id) {
      reviewService.checkReviewForTransaction(id)
        .then((review) => {
          setExistingReview(review)
          setReviewChecked(true)
        })
        .catch(() => setReviewChecked(true))
    }
  }, [currentTransaction?.status, id])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return
    try {
      await dispatch(updateTransactionStatus({ id, status: newStatus })).unwrap()
    } catch {
      // error handled by slice
    }
  }

  const handleReviewSubmit = async (data: { transactionId: string; revieweeId: string; rating: number; comment: string }) => {
    const review = await reviewService.createReview(data)
    setExistingReview(review)
    setShowReviewForm(false)
  }

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

  if (!currentTransaction) {
    return <p className="text-center py-8">{t('transaction.notFound')}</p>
  }

  const tx = currentTransaction
  const isOwner = user?.id === tx.ownerId
  const isBorrower = user?.id === tx.borrowerId
  const revieweeId = isOwner ? tx.borrowerId : tx.ownerId
  const revieweeName = isOwner ? tx.borrowerName : tx.ownerName

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SEO title={t('transaction.myTransactions')} />
      <button onClick={() => navigate(-1)} className="text-primary hover:underline">
        {t('common.back')}
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
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
        <div className="grid grid-cols-2 gap-6 border-t dark:border-gray-700 pt-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('transaction.owner')}</p>
            <p className="font-semibold">{tx.ownerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('transaction.borrower')}</p>
            <p className="font-semibold">{tx.borrowerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('transaction.startDate')}</p>
            <p className="font-semibold">{tx.startDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('transaction.endDate')}</p>
            <p className="font-semibold">{tx.endDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('transaction.totalAmount')}</p>
            <p className="font-semibold text-lg">
              {tx.isFree ? <span className="text-green-600">{t('listing.free')}</span> : `$${tx.totalAmount}`}
            </p>
          </div>
          {!tx.isFree && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('transaction.serviceFee')}</p>
              <p className="font-semibold">${tx.serviceFee}</p>
            </div>
          )}
          {!tx.isFree && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('transaction.paymentStatus')}</p>
              <p className="font-semibold">{tx.paymentStatus}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('transaction.createdAt')}</p>
            <p className="font-semibold">{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}</p>
          </div>
          {tx.completedAt && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('transaction.completedAt')}</p>
              <p className="font-semibold">{new Date(tx.completedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Free Transaction Info */}
        {tx.isFree && tx.status === 'PENDING' && (
          <div className="border-t dark:border-gray-700 pt-6">
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-4 rounded-lg">
              <p className="font-semibold text-green-800 dark:text-green-300">{t('transaction.freeTransaction')}</p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">{t('transaction.waitingOwnerApproval')}</p>
            </div>
          </div>
        )}

        {/* Payment Section (only for paid transactions) */}
        {!tx.isFree && tx.status === 'PENDING' && isBorrower && !showPayment && (
          <div className="border-t dark:border-gray-700 pt-6">
            <button
              onClick={() => setShowPayment(true)}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              {t('payment.payNow')}
            </button>
          </div>
        )}

        {!tx.isFree && showPayment && id && (
          <div className="border-t dark:border-gray-700 pt-6 space-y-3">
            {paymentError && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
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
        <div className="border-t dark:border-gray-700 pt-6 flex gap-3">
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
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
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
                className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                {t('transaction.dispute')}
              </button>
            </>
          )}
        </div>

        {/* Review Section */}
        {tx.status === 'COMPLETED' && reviewChecked && (
          <div className="border-t dark:border-gray-700 pt-6">
            {existingReview ? (
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-300 mb-2">{t('review.alreadyReviewed')}</p>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= existingReview.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}>
                      ★
                    </span>
                  ))}
                </div>
                {existingReview.comment && (
                  <p className="text-gray-700 dark:text-gray-200 text-sm">{existingReview.comment}</p>
                )}
              </div>
            ) : showReviewForm && id ? (
              <ReviewForm
                transactionId={id}
                revieweeId={revieweeId}
                revieweeName={revieweeName}
                onSubmit={handleReviewSubmit}
                onCancel={() => setShowReviewForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
              >
                {t('review.leaveReview')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionDetailPage
