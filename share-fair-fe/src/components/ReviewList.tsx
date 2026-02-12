import { useTranslation } from 'react-i18next'
import type { ReviewResponse } from '../services/reviewService'

interface ReviewListProps {
  reviews: ReviewResponse[]
  loading?: boolean
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ))}
  </div>
)

const ReviewList = ({ reviews, loading }: ReviewListProps) => {
  const { t } = useTranslation()

  if (loading) {
    return <p className="text-center py-4 text-gray-500">{t('common.loading')}</p>
  }

  if (reviews.length === 0) {
    return <p className="text-center py-4 text-gray-500">{t('review.noReviews')}</p>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border rounded-lg p-4">
          <div className="flex items-start gap-3">
            {review.reviewerAvatar ? (
              <img
                src={review.reviewerAvatar}
                alt={review.reviewerName || ''}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                {(review.reviewerName || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{review.reviewerName || t('common.unknown')}</p>
                <p className="text-sm text-gray-500">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                </p>
              </div>
              <StarRating rating={review.rating} />
              {review.comment && (
                <p className="mt-2 text-gray-700">{review.comment}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReviewList
