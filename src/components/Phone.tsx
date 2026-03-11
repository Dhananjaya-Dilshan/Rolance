// Phone.tsx
import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface PhoneProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string
  model: string // Add model prop
  dark?: boolean
}

const Phone = ({ imgSrc, model, className, dark = false, ...props }: PhoneProps) => {
  // Function to get the correct phone template based on model
  const getPhoneTemplateImage = (modelValue: string) => {
    return `/template/phone/phone-template-${modelValue}.png`
  }

  return (
    <div
      className={cn(
        'relative pointer-events-none z-50 overflow-hidden',
        className
      )}
      {...props}>
      <img
        src={getPhoneTemplateImage(model)} // Use dynamic template based on model
        className='pointer-events-none z-50 select-none'
        alt='phone image'
        onError={(e) => {
          e.currentTarget.src = dark
            ? '/phone-template-dark-edges.png'
            : '/phone-template-white-edges.png' // Fallback image
        }}
      />

      <div className='absolute -z-10 inset-0'>
        <img
          className='object-cover min-w-full min-h-full'
          src={imgSrc}
          alt='overlaying phone image'
        />
      </div>
    </div>
  )
}

export default Phone