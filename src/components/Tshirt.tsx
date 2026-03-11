import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface TshirtProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string
  dark?: boolean
}

const Tshirt = ({ imgSrc, className, dark = false, ...props }: TshirtProps) => {
  return (
    <div
      className={cn(
        'relative pointer-events-none z-50 overflow-hidden',
        className
      )}
      {...props}>
      <img
        src={
          dark
            ? '/Tshirt-template-dark-edges.png'
            : '/freepik__upload__8ere5552.png'
        }
        className='pointer-events-none z-50 select-none'
        alt='Tshirt image'
      />

      <div className='absolute -z-10 inset-0'>
        <img
          className='object-cover min-w-full min-h-full'
          src={imgSrc}
          alt='overlaying Tshirt image'
        />
      </div>
    </div>
  )
}

export default Tshirt
