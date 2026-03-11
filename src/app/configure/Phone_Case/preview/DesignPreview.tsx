'use client'

import Phone from '@/components/Phone'
import { Button } from '@/components/ui/button'
import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products'
import { cn, formatPrice } from '@/lib/utils'
import { FINISHES, MODELS } from '@/validators/option-validator'
import { Configuration } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import Confetti from 'react-dom-confetti'
import { createCheckoutSession } from './actions'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const DesignPreview = ({ configuration }: { configuration: Configuration }) => {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = configuration
  const { user } = useKindeBrowserClient()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false)
  const [sellOnlineOpen, setSellOnlineOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [commissionRate, setCommissionRate] = useState(0)

  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  useEffect(() => setShowConfetti(true))

  const { color, model, finish, material } = configuration

  const { label: modelLabel } = MODELS.options.find(
    ({ value }) => value === model
  )!

  let totalPrice = BASE_PRICE
  if (material === 'polycarbonate')
    totalPrice += PRODUCT_PRICES.material.polycarbonate
  if (finish === 'textured') totalPrice += PRODUCT_PRICES.finish.textured

  const { mutate: createPaymentSession } = useMutation({
    mutationKey: ['get-checkout-session'],
    mutationFn: createCheckoutSession,
    onSuccess: ({ url }) => {
      if (url) router.push(url)
      else throw new Error('Unable to retrieve payment URL.')
    },
    onError: () => {
      toast({
        title: 'Something went wrong',
        description: 'There was an error on our end. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const handleSellOnline = async () => {
    try {
      // Retrieve the user and token from localStorage
      const userString = localStorage.getItem('user')
      const token = localStorage.getItem('token')
  
      if (!userString) {
        alert('Please log in to submit a design')
        return
      }
  
      const response = await fetch('/api/designs/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userString}` // Send user details in the Authorization header
        },
        body: JSON.stringify({
          configurationId: configuration.id,
          title,
          description,
          tags: tags.split(',').map(tag => tag.trim()),
          commissionRate,
        }),
      })
  
      if (!response.ok) throw new Error('Failed to submit design')
  
      const data = await response.json()
      setSellOnlineOpen(false)
      alert('Design submitted successfully!')
    } catch (error) {
      console.error('Error submitting design:', error)
      alert('Failed to submit design. Please try again.')
    }
  }

  return (
    <>
      <div
        aria-hidden='true'
        className='pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center'>
        <Confetti
          active={showConfetti}
          config={{ elementCount: 200, spread: 90 }}
        />
      </div>

      <div className='mt-20 flex flex-col items-center md:grid text-sm sm:grid-cols-12 sm:grid-rows-1 sm:gap-x-6 md:gap-x-8 lg:gap-x-12'>
        <div className='md:col-span-4 lg:col-span-3 md:row-span-2 md:row-end-2'>
        <Phone
            className={cn("max-w-[150px] md:max-w-full")}
            style={{ backgroundColor: color || '#000000' }}
            imgSrc={configuration.croppedImageUrl!}
            model={model} // Pass the model to Phone component
          />
        </div>

        <div className='mt-6 sm:col-span-9 md:row-end-1'>
          <h3 className='text-3xl font-bold tracking-tight text-gray-900'>
            Your {modelLabel} Case
          </h3>
          <div className='mt-3 flex items-center gap-1.5 text-base'>
            <Check className='h-4 w-4 text-green-500' />
            In stock and ready to ship
          </div>
        </div>

        <div className='sm:col-span-12 md:col-span-9 text-base'>
          <div className='grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10'>
            <div>
              <p className='font-medium text-zinc-950'>Highlights</p>
              <ol className='mt-3 text-zinc-700 list-disc list-inside'>
                <li>Wireless charging compatible</li>
                <li>TPU shock absorption</li>
                <li>Packaging made from recycled materials</li>
                <li>5 year print warranty</li>
              </ol>
            </div>
            <div>
              <p className='font-medium text-zinc-950'>Materials</p>
              <ol className='mt-3 text-zinc-700 list-disc list-inside'>
                <li>High-quality, durable material</li>
                <li>Scratch- and fingerprint resistant coating</li>
              </ol>
            </div>
          </div>

          <div className='mt-8'>
            <div className='bg-gray-50 p-6 sm:rounded-lg sm:p-8'>
              <div className='flow-root text-sm'>
                <div className='flex items-center justify-between py-1 mt-2'>
                  <p className='text-gray-600'>Base price</p>
                  <p className='font-medium text-gray-900'>
                    {formatPrice(BASE_PRICE / 100)}
                  </p>
                </div>

                {finish === 'textured' ? (
                  <div className='flex items-center justify-between py-1 mt-2'>
                    <p className='text-gray-600'>Textured finish</p>
                    <p className='font-medium text-gray-900'>
                      {formatPrice(PRODUCT_PRICES.finish.textured / 100)}
                    </p>
                  </div>
                ) : null}

                {material === 'polycarbonate' ? (
                  <div className='flex items-center justify-between py-1 mt-2'>
                    <p className='text-gray-600'>Soft polycarbonate material</p>
                    <p className='font-medium text-gray-900'>
                      {formatPrice(PRODUCT_PRICES.material.polycarbonate / 100)}
                    </p>
                  </div>
                ) : null}

                <div className='my-2 h-px bg-gray-200' />

                <div className='flex items-center justify-between py-2'>
                  <p className='font-semibold text-gray-900'>Order total</p>
                  <p className='font-semibold text-gray-900'>
                    {formatPrice(totalPrice / 100)}
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-8 flex justify-end pb-12'>
              <div className='pr-10'>
              <Button
  onClick={() => router.push(`/shops?configurationId=${id}`)}
  className='px-4 sm:px-6 lg:px-8'>
  Choose shop <ArrowRight className='h-4 w-4 ml-1.5 inline' />
</Button>
              </div>
              <Dialog open={sellOnlineOpen} onOpenChange={setSellOnlineOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => setSellOnlineOpen(true)}
            className="px-4 sm:px-6 lg:px-8"
          >
            Sell Online <ArrowRight className="h-4 w-4 ml-1.5 inline" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell Your Design Online</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Design Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter design title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter design description"
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., modern, minimal, colorful"
              />
            </div>
            <div>
              <Label>Commission Rate (%)</Label>
              <Input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                placeholder="Enter commission rate"
              />
            </div>
            <Button onClick={handleSellOnline}>Submit Design</Button>
          </div>
        </DialogContent>
      </Dialog>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DesignPreview