import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ReviewFormProps {
  transactionId: string
  revieweeId: string
  revieweeName: string
  onSubmit: (data: { transactionId: string; revieweeId: string; rating: number; comment: string }) => Promise<void>
  onCancel: () => void
}

const ReviewForm = ({ transactionId, revieweeId, revieweeName, onSubmit, onCancel }: ReviewFormProps) => {
  const { t } = useTranslation()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t('review.invalidRating'))
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({ transactionId, revieweeId, rating, comment })
    } catch {
      setError(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <h3 className="font-bold">{t('review.leaveReview')} {revieweeName}</h3>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">{t('review.rating')}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-3xl focus:outline-none"
            >
              <span className={star <= (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{t('review.comment')}</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('review.commentPlaceholder')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? t('common.loading') : t('review.submit')}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}

export default ReviewForm
