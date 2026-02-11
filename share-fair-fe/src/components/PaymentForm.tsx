import { useState, useEffect } from 'react'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useTranslation } from 'react-i18next'
import paymentService from '../services/paymentService'

interface PaymentFormProps {
  transactionId: string
  onSuccess: () => void
  onError: (message: string) => void
}

const CheckoutForm = ({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string) => void }) => {
  const { t } = useTranslation()
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/return`,
      },
    })

    if (error) {
      onError(error.message || t('payment.failed'))
      setIsProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {isProcessing ? t('payment.processing') : t('payment.payNow')}
      </button>
    </form>
  )
}

const PaymentForm = ({ transactionId, onSuccess, onError }: PaymentFormProps) => {
  const { t } = useTranslation()
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initPayment = async () => {
      try {
        const response = await paymentService.createPaymentIntent(transactionId)
        setStripePromise(loadStripe(response.publishableKey))
        setClientSecret(response.clientSecret)
      } catch {
        onError(t('payment.failed'))
      } finally {
        setLoading(false)
      }
    }
    initPayment()
  }, [transactionId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <p className="text-center py-4">{t('common.loading')}</p>
  }

  if (!stripePromise || !clientSecret) {
    return null
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}

export default PaymentForm
