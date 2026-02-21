import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { useAuth } from '../hooks/useAuth'
import { fetchTransaction, updateTransactionStatus } from '../store/slices/transactionSlice'
import PaymentForm from '../components/PaymentForm'
import ReviewForm from '../components/ReviewForm'
import DisputeForm from '../components/DisputeForm'
import SEO from '../components/SEO'
import reviewService from '../services/reviewService'
import disputeService, { type DisputeResponse } from '../services/disputeService'
import insuranceService from '../services/insuranceService'
import messageService from '../services/messageService'
import type { ReviewResponse } from '../services/reviewService'
import type { InsurancePolicy, InsuranceClaim, CoverageType } from '../types'
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
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [existingDispute, setExistingDispute] = useState<DisputeResponse | null>(null)
  const [insurancePolicy, setInsurancePolicy] = useState<InsurancePolicy | null>(null)
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([])
  const [showInsuranceSelector, setShowInsuranceSelector] = useState(false)
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [claimDescription, setClaimDescription] = useState('')
  const [claimAmount, setClaimAmount] = useState('')
  const [selectedCoverage, setSelectedCoverage] = useState<CoverageType>('BASIC')
  const [addingInsurance, setAddingInsurance] = useState(false)
  const [filingClaim, setFilingClaim] = useState(false)

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
    if (currentTransaction?.status === 'DISPUTED' && id) {
      disputeService.getDisputeByTransaction(id).then(setExistingDispute)
    }
    if (id && (currentTransaction?.status === 'PENDING' || currentTransaction?.status === 'ACTIVE' || currentTransaction?.status === 'COMPLETED')) {
      insuranceService.getPolicyForTransaction(id)
        .then((policy) => {
          setInsurancePolicy(policy)
          if (policy) {
            insuranceService.getClaims(policy.id).then(setInsuranceClaims).catch(() => {})
          }
        })
        .catch(() => {})
    }
  }, [currentTransaction?.status, id])

  const handleAddInsurance = async () => {
    if (!id) return
    setAddingInsurance(true)
    try {
      const policy = await insuranceService.addInsurance(id, selectedCoverage)
      setInsurancePolicy(policy)
      setShowInsuranceSelector(false)
    } catch {
      // ignore
    } finally {
      setAddingInsurance(false)
    }
  }

  const handleFileClaim = async () => {
    if (!insurancePolicy || !claimDescription || !claimAmount) return
    setFilingClaim(true)
    try {
      const claim = await insuranceService.fileClaim(insurancePolicy.id, claimDescription, parseFloat(claimAmount))
      setInsuranceClaims((prev) => [claim, ...prev])
      setInsurancePolicy((p) => p ? { ...p, status: 'CLAIMED' } : p)
      setShowClaimForm(false)
      setClaimDescription('')
      setClaimAmount('')
    } catch {
      // ignore
    } finally {
      setFilingClaim(false)
    }
  }

  const handleOpenChat = async () => {
    if (!currentTransaction) return
    const otherUserId = user?.id === currentTransaction.ownerId ? currentTransaction.borrowerId : currentTransaction.ownerId
    try {
      await messageService.startConversation(otherUserId, id)
      window.location.href = '/messages'
    } catch {
      // ignore
    }
  }

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

        {/* Insurance Section */}
        {!tx.isFree && (tx.status === 'PENDING' || tx.status === 'ACTIVE' || tx.status === 'COMPLETED') && (
          <div className="border-t dark:border-gray-700 pt-6 space-y-4">
            <h3 className="font-semibold">{t('insurance.title')}</h3>

            {insurancePolicy ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-800 dark:text-blue-300">
                    {t(`insurance.coverage.${insurancePolicy.coverageType}`)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    insurancePolicy.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    insurancePolicy.status === 'CLAIMED' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {t(`insurance.status.${insurancePolicy.status}`)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('insurance.premium')}: <strong>${insurancePolicy.premiumAmount}</strong> &bull;{' '}
                  {t('insurance.maxCoverage')}: <strong>${insurancePolicy.maxCoverage}</strong>
                </p>
                {insuranceClaims.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {insuranceClaims.map((claim) => (
                      <div key={claim.id} className="text-sm bg-white dark:bg-gray-800 rounded p-2">
                        <span className="font-medium">{t('insurance.claim')}: ${claim.claimAmount}</span>
                        {' — '}
                        <span className="text-gray-500">{t(`insurance.claimStatus.${claim.status}`)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {insurancePolicy.status === 'ACTIVE' && isBorrower && !showClaimForm && (
                  <button
                    onClick={() => setShowClaimForm(true)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
                  >
                    {t('insurance.fileClaim')}
                  </button>
                )}
                {showClaimForm && (
                  <div className="space-y-3 pt-2">
                    <textarea
                      value={claimDescription}
                      onChange={(e) => setClaimDescription(e.target.value)}
                      placeholder={t('insurance.claimDescriptionPlaceholder')}
                      rows={3}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                    />
                    <input
                      type="number"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      placeholder={t('insurance.claimAmountPlaceholder')}
                      min="0"
                      max={insurancePolicy.maxCoverage}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleFileClaim}
                        disabled={filingClaim || !claimDescription || !claimAmount}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {filingClaim ? t('common.loading') : t('insurance.submitClaim')}
                      </button>
                      <button onClick={() => setShowClaimForm(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isBorrower && (tx.status === 'PENDING' || tx.status === 'ACTIVE') ? (
              <>
                {!showInsuranceSelector ? (
                  <button
                    onClick={() => setShowInsuranceSelector(true)}
                    className="text-sm px-4 py-2 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    {t('insurance.addInsurance')}
                  </button>
                ) : (
                  <div className="border dark:border-gray-700 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium">{t('insurance.selectCoverage')}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {(['BASIC', 'STANDARD', 'PREMIUM'] as CoverageType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedCoverage(type)}
                          className={`p-3 rounded-lg border text-center text-sm ${
                            selectedCoverage === type
                              ? 'border-primary bg-primary/10 text-primary font-semibold'
                              : 'border-gray-200 dark:border-gray-600 hover:border-primary/50'
                          }`}
                        >
                          <div className="font-medium">{t(`insurance.coverage.${type}`)}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ${insuranceService.calculatePremium(tx.totalAmount, type)}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {t('insurance.covers')} ${insuranceService.getMaxCoverage(tx.totalAmount, type)}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddInsurance}
                        disabled={addingInsurance}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
                      >
                        {addingInsurance ? t('common.loading') : t('insurance.confirm')}
                      </button>
                      <button onClick={() => setShowInsuranceSelector(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('insurance.notAvailable')}</p>
            )}
          </div>
        )}

        {/* Message Other Party */}
        {(tx.status === 'PENDING' || tx.status === 'ACTIVE') && (
          <div className="border-t dark:border-gray-700 pt-4">
            <button
              onClick={handleOpenChat}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {t('messages.messageOtherParty')}
            </button>
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
                onClick={() => setShowDisputeForm(true)}
                className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                {t('transaction.dispute')}
              </button>
            </>
          )}
        </div>

        {/* Dispute Form */}
        {showDisputeForm && id && (
          <div className="border-t dark:border-gray-700 pt-6">
            <DisputeForm
              transactionId={id}
              onSubmitted={(dispute) => {
                setExistingDispute(dispute)
                setShowDisputeForm(false)
                dispatch(fetchTransaction(id))
              }}
              onCancel={() => setShowDisputeForm(false)}
            />
          </div>
        )}

        {/* Dispute Status */}
        {tx.status === 'DISPUTED' && existingDispute && (
          <div className="border-t dark:border-gray-700 pt-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-2">
              <p className="font-bold text-red-700 dark:text-red-400">⚠️ {t('dispute.activeDispute')}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{t('dispute.reason')}:</span>{' '}
                {t(`dispute.reason.${existingDispute.reason}`)}
              </p>
              {existingDispute.details && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{existingDispute.details}</p>
              )}
              <p className="text-sm">
                <span className="font-medium">{t('dispute.status')}:</span>{' '}
                <span className="text-red-600 dark:text-red-400 font-semibold">{existingDispute.status}</span>
              </p>
              {existingDispute.resolution && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{t('dispute.resolution')}:</span> {existingDispute.resolution}
                </p>
              )}
            </div>
          </div>
        )}

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
