'use client'

import { Button } from '@/components/ui/button'
import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products'
import { cn, formatPrice } from '@/lib/utils'
import { TSHIRT_SIZES, TSHIRT_FINISHES, TSHIRT_MATERIALS } from '@/validators/option-validator'
import { TSHIRTConfiguration } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import Confetti from 'react-dom-confetti'
import { createCheckoutSession } from './actions'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import NextImage from 'next/image'
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

const DesignPreview = ({ TSHIRTConfiguration }: { TSHIRTConfiguration: TSHIRTConfiguration }) => {
  const router = useRouter()
  const { toast } = useToast()
  const { id, color, size, finish, material, croppedImageUrl } = TSHIRTConfiguration
  const { user } = useKindeBrowserClient()

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false)
  const [sellOnlineOpen, setSellOnlineOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [commissionRate, setCommissionRate] = useState(0)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  useEffect(() => setShowConfetti(true), [])

  // Find the label for the selected size
  const { label: sizeLabel } = TSHIRT_SIZES.options.find(
    ({ value }) => value === size
  ) || TSHIRT_SIZES.options[0]

  // Calculate total price based on material and finish
  let totalPrice = BASE_PRICE
  if (material === 'polyester') totalPrice += PRODUCT_PRICES.material.polyester || 200
  if (finish === 'premium') totalPrice += PRODUCT_PRICES.finish.premium || 300

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
      const response = await fetch('/api/designs/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          TSHIRTConfigurationId: TSHIRTConfiguration.id,
          title,
          description,
          tags: tags.split(',').map(tag => tag.trim()),
          commissionRate,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit design')

      const data = await response.json()
      setSellOnlineOpen(false)
      toast({
        title: 'Success',
        description: 'Design submitted successfully!',
      })
    } catch (error) {
      console.error('Error submitting design:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit design. Please try again.',
        variant: 'destructive',
      })
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
        {/* T-shirt Front and Back Preview */}
        <div className='md:col-span-4 lg:col-span-3 md:row-span-2 md:row-end-2'>
          {/* Front View */}
          <div className='relative w-[150px] md:w-[240px]'>
            <NextImage
              src='/template/tshirt/tshirt-front.png'
              width={240}
              height={360}
              alt='T-shirt Front'
              className='pointer-events-none z-50 select-none'
              style={{ backgroundColor: color || '#000000' }}
            />
            {croppedImageUrl && (
              <NextImage
                src={croppedImageUrl}
                fill
                alt='Front Design'
                className='object-cover pointer-events-none'
              />
            )}
          </div>
          {/* Back View (Assuming back design is stored separately or not yet implemented) */}
          <div className='relative w-[150px] md:w-[240px] mt-4'>
            <NextImage
              src='/template/tshirt/tshirt-back.png'
              width={240}
              height={360}
              alt='T-shirt Back'
              className='pointer-events-none z-50 select-none'
              style={{ backgroundColor: color || '#000000' }}
            />
            {/* Add back design here if implemented */}
          </div>
        </div>

        {/* Title and Stock Info */}
        <div className='mt-6 sm:col-span-9 md:row-end-1'>
          <h3 className='text-3xl font-bold tracking-tight text-gray-900'>
            Your {sizeLabel} T-Shirt
          </h3>
          <div className='mt-3 flex items-center gap-1.5 text-base'>
            <Check className='h-4 w-4 text-green-500' />
            In stock and ready to ship
          </div>
        </div>

        {/* Details and Pricing */}
        <div className='sm:col-span-12 md:col-span-9 text-base'>
          <div className='grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10'>
            <div>
              <p className='font-medium text-zinc-950'>Highlights</p>
              <ol className='mt-3 text-zinc-700 list-disc list-inside'>
                <li>Breathable fabric</li>
                <li>Double-stitched seams</li>
                <li>Machine washable</li>
                <li>Eco-friendly printing</li>
              </ol>
            </div>
            <div>
              <p className='font-medium text-zinc-950'>TSHIRT_MATERIALS</p>
              <ol className='mt-3 text-zinc-700 list-disc list-inside'>
                <li>{material === 'cotton' ? '100% Cotton' : 'Polyester Blend'}</li>
                <li>{finish === 'premium' ? 'Premium vivid print' : 'Standard print quality'}</li>
              </ol>
            </div>
          </div>

          {/* Pricing Section */}
          <div className='mt-8'>
            <div className='bg-gray-50 p-6 sm:rounded-lg sm:p-8'>
              <div className='flow-root text-sm'>
                <div className='flex items-center justify-between py-1 mt-2'>
                  <p className='text-gray-600'>Base price</p>
                  <p className='font-medium text-gray-900'>
                    {formatPrice(BASE_PRICE / 100)}
                  </p>
                </div>

                {finish === 'premium' && (
                  <div className='flex items-center justify-between py-1 mt-2'>
                    <p className='text-gray-600'>Premium Print</p>
                    <p className='font-medium text-gray-900'>
                      {formatPrice((PRODUCT_PRICES.finish.premium || 300) / 100)}
                    </p>
                  </div>
                )}

                {material === 'polyester' && (
                  <div className='flex items-center justify-between py-1 mt-2'>
                    <p className='text-gray-600'>Polyester Material</p>
                    <p className='font-medium text-gray-900'>
                      {formatPrice((PRODUCT_PRICES.material.polyester || 200) / 100)}
                    </p>
                  </div>
                )}

                <div className='my-2 h-px bg-gray-200' />

                <div className='flex items-center justify-between py-2'>
                  <p className='font-semibold text-gray-900'>Order total</p>
                  <p className='font-semibold text-gray-900'>
                    {formatPrice(totalPrice / 100)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='mt-8 flex justify-end pb-12'>
              <div className='pr-10'>
                <Button
                  onClick={() => router.push(`/shops?TSHIRTConfigurationId=${id}`)}
                  className='px-4 sm:px-6 lg:px-8'>
                  Choose Shop <ArrowRight className='h-4 w-4 ml-1.5 inline' />
                </Button>
              </div>
              <Dialog open={sellOnlineOpen} onOpenChange={setSellOnlineOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setSellOnlineOpen(true)}
                    className='px-4 sm:px-6 lg:px-8'>
                    Sell Online <ArrowRight className='h-4 w-4 ml-1.5 inline' />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sell Your Design Online</DialogTitle>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div>
                      <Label>Design Title</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Enter design title'
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder='Enter design description'
                      />
                    </div>
                    <div>
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder='e.g., modern, minimal, colorful'
                      />
                    </div>
                    <div>
                      <Label>Commission Rate (%)</Label>
                      <Input
                        type='number'
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Number(e.target.value))}
                        placeholder='Enter commission rate'
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