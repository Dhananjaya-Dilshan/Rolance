// app/orders/success/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [error, setError] = useState('')

  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setError('Order ID missing')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) throw new Error('Failed to verify payment')
        
        const data = await response.json()
        setPaymentVerified(data.paid)
        
        if (data.paid) {
          // Optionally update the order status here if needed
          await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'awaiting_shipment' })
          })
        }
      } catch (err) {
        console.error('Payment verification error:', err)
        setError('Failed to verify payment')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-2 text-red-500">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!paymentVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-2">Payment Processing</h1>
          <p className="text-gray-600 mb-6">
            Your payment is still being processed. Please check back later or contact support.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your order is now being processed and will be shipped soon.
        </p>
        <Button onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  )
}