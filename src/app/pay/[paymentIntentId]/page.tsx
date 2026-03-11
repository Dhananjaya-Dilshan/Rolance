// app/pay/[paymentIntentId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js'

// Load Stripe outside of components
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Payment Form Component
function PaymentForm({ paymentIntentId }: { paymentIntentId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [order, setOrder] = useState<any>(null)

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/payment-intent/${paymentIntentId}`)
        const data = await response.json()
        setOrder(data.order)
      } catch (err) {
        setError('Failed to fetch order details')
      }
    }
    fetchOrderDetails()
  }, [paymentIntentId])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    try {
      // Confirm card payment
      const result = await stripe.confirmCardPayment(order.paymentIntentId, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: order.customer.username
          }
        }
      })

      if (result.error) {
        setError(result.error.message || 'Payment failed')
        setProcessing(false)
      } else {
        // Send payment confirmation to backend
        const response = await fetch(`/api/orders/${order.id}/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            paymentIntentId: result.paymentIntent.id 
          })
        })

        const data = await response.json()
        
        if (data.success) {
          // Redirect to order confirmation page
          window.location.href = `/orders/confirmation/${order.id}`
        } else {
          setError('Failed to process payment')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }

    setProcessing(false)
  }

  if (!order) return <div>Loading order details...</div>

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Pay for Order #{order.id}</h2>
      
      <div className="mb-4">
        <p>Total Amount: ${order.amount.toFixed(2)}</p>
      </div>

      <div className="mb-4">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={processing || !stripe}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  )
}

// Page Component
export default function PaymentPage({ 
  params 
}: { 
  params: { paymentIntentId: string } 
}) {
  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <PaymentForm paymentIntentId={params.paymentIntentId} />
      </div>
    </Elements>
  )
}