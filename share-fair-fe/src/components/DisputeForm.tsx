import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import disputeService, { type DisputeReason, type DisputeResponse } from '../services/disputeService'

const REASONS: { value: DisputeReason; labelKey: string }[] = [
  { value: 'ITEM_NOT_RETURNED', labelKey: 'dispute.reason.ITEM_NOT_RETURNED' },
  { value: 'ITEM_DAMAGED',      labelKey: 'dispute.reason.ITEM_DAMAGED' },
  { value: 'NO_SHOW',           labelKey: 'dispute.reason.NO_SHOW' },
  { value: 'PAYMENT_ISSUE',     labelKey: 'dispute.reason.PAYMENT_ISSUE' },
  { value: 'MISREPRESENTATION', labelKey: 'dispute.reason.MISREPRESENTATION' },
  { value: 'OTHER',             labelKey: 'dispute.reason.OTHER' },
]

interface Props {
  transactionId: string
  onSubmitted: (dispute: DisputeResponse) => void
  onCancel: () => void
}

export default function DisputeForm({ transactionId, onSubmitted, onCancel }: Props) {
  const { t } = useTranslation()
  const [reason, setReason] = useState<DisputeReason>('OTHER')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const dispute = await disputeService.createDispute(transactionId, reason, details)
      onSubmitted(dispute)
    } catch (err: any) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-red-700 dark:text-red-400">{t('dispute.fileDispute')}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{t('dispute.description')}</p>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('dispute.reason')}
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value as DisputeReason)}
          className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>{t(r.labelKey)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('dispute.details')}
        </label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          placeholder={t('dispute.detailsPlaceholder')}
          className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? t('common.loading') : t('dispute.submit')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300"
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  )
}
