// app/designs/[id]/DesignDetailClient.tsx (Client Component)
'use client'

import { useState } from 'react'
import Phone from '@/components/Phone'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, ZoomIn, RotateCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DesignDetailClientProps {
  color: string
  croppedImageUrl: string
  model: string
  configurationId: string
  price: number
}

const DesignDetailClient = ({ 
  color, 
  croppedImageUrl, 
  model, 
  configurationId,
  price
}: DesignDetailClientProps) => {
  const router = useRouter()
  const [rotation, setRotation] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const rotatePhone = () => {
    setRotation((prev) => (prev + 45) % 360)
  }

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  return (
    <>
      <div className='md:col-span-4 lg:col-span-3 md:row-span-2 md:row-end-2 relative'>
        <div 
          className={cn(
            'transition-all duration-500 ease-in-out',
            isZoomed ? 'scale-125 z-10' : 'scale-100'
          )}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <Phone
            className={cn('max-w-[200px] md:max-w-full mx-auto')}
            style={{ backgroundColor: color }}
            imgSrc={croppedImageUrl}
            model={model}
          />
        </div>
        
        {/* Interactive controls */}
        <div className="flex space-x-2 justify-center mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={rotatePhone}
            className="rounded-full w-10 h-10 p-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleZoom}
            className="rounded-full w-10 h-10 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CTA Section */}
      <div className='sm:col-span-12 md:col-span-9 mt-8'>
        <div className='sticky bottom-4 left-0 right-0 bg-white shadow-lg rounded-lg p-4 flex justify-between items-center border border-gray-100'>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">${(price/100).toFixed(2)}</span>
            <span className="text-sm text-gray-500 ml-2">Including customization</span>
          </div>
          <Button
            onClick={() => router.push(`/shops?configurationId=${configurationId}`)}
            className='px-6 py-2 text-base'
            size="lg"
          >
            Choose shop <ArrowRight className='h-5 w-5 ml-2 inline' />
          </Button>
        </div>
      </div>
    </>
  )
}

export default DesignDetailClient