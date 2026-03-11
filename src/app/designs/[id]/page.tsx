// app/designs/[id]/page.tsx (Server Component)
import { db } from '@/db'
import { notFound } from 'next/navigation'
import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products'
import { formatPrice } from '@/lib/utils'
import { MODELS, FINISHES, MATERIALS } from '@/validators/option-validator'
import { Check, Info, Shield, Truck, Gift } from 'lucide-react'
import DesignDetailClient from './DesignDetailClient'

interface PageProps {
  params: {
    id: string
  }
}

async function getDesign(id: string) {
  const design = await db.design.findUnique({
    where: { id },
    include: { configuration: true }
  })
  
  if (!design || design.status !== 'approved') {
    return null
  }
  
  return design
}

const DesignDetailPage = async ({ params }: PageProps) => {
  const design = await getDesign(params.id)

  if (!design) {
    return notFound()
  }

  const { configuration } = design
  const { id: configurationId, color, model, finish, material, croppedImageUrl } = configuration

  const modelOption = MODELS.options.find(({ value }) => value === model)
  const modelLabel = modelOption?.label || 'Phone Case'

  const finishOption = FINISHES.options.find(({ value }) => value === finish)
  const finishLabel = finishOption?.label || 'Finish'

  const materialOption = MATERIALS.options.find(({ value }) => value === material)
  const materialLabel = materialOption?.label || 'Material'

  // Calculate price using the same logic as in products page
  let totalPrice = BASE_PRICE
  if (material === 'polycarbonate') totalPrice += PRODUCT_PRICES.material.polycarbonate
  if (finish === 'textured') totalPrice += PRODUCT_PRICES.finish.textured

  // Apply commission and shop rate to get final selling price
  const commissionRate = design.commissionRate / 100;
  const shopRate = 0.1; // Example shop rate (10%)
  const sellingPrice = totalPrice * (1 + commissionRate + shopRate);

  return (
    <div className='mt-8 px-4 max-w-7xl mx-auto'>
      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <a href="#" className="text-gray-500 hover:text-gray-700">Home</a>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="flex items-center">
            <a href="#" className="text-gray-500 hover:text-gray-700">Designs</a>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="text-gray-700">{design.title}</li>
        </ol>
      </nav>

      <div className='flex flex-col md:grid md:grid-cols-12 md:gap-x-8 lg:gap-x-12'>
        {/* Phone Preview - Client Component */}
        <DesignDetailClient
          color={color || '#000000'}
          croppedImageUrl={croppedImageUrl!} 
          model={model}
          configurationId={configurationId}
          price={sellingPrice} // Pass the final selling price instead of just totalPrice
        />

        {/* Product Information */}
        <div className='md:col-span-8'>
          {/* Title and Status */}
          <div className='mt-6 md:mt-0'>
            <div className="flex flex-wrap gap-2 mb-2">
              {design.tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-block bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700'
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
              {design.title} - {modelLabel}
            </h1>
            <div className='mt-3 flex items-center gap-1.5 text-base'>
              <Check className='h-4 w-4 text-green-500' />
              <span className="font-medium text-green-600">In stock</span> and ready to ship
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className='text-zinc-700'>{design.description}</p>
          </div>

          {/* Features Section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">5 Year Warranty</h3>
                  <p className="mt-1 text-sm text-gray-500">Print quality guaranteed for 5 years.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-50 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Free Shipping</h3>
                  <p className="mt-1 text-sm text-gray-500">On orders over $35.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-purple-50 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Gift Ready</h3>
                  <p className="mt-1 text-sm text-gray-500">Premium packaging available.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-yellow-50 flex items-center justify-center">
                  <Info className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Wireless Charging</h3>
                  <p className="mt-1 text-sm text-gray-500">Compatible with all wireless chargers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4">Specifications</h2>
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Model</dt>
                    <dd className="mt-1 text-sm text-gray-900">{modelLabel}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Material</dt>
                    <dd className="mt-1 text-sm text-gray-900">{materialLabel}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Finish</dt>
                    <dd className="mt-1 text-sm text-gray-900">{finishLabel}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Color</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                      <span className="h-4 w-4 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                      {color}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4">Pricing Breakdown</h2>
            <div className='bg-gray-50 p-6 rounded-lg'>
              <div className='flow-root text-sm'>
                <div className='flex items-center justify-between py-1 mt-2'>
                  <p className='text-gray-600'>Base price</p>
                  <p className='font-medium text-gray-900'>
                    {formatPrice(BASE_PRICE / 100)}
                  </p>
                </div>

                {finish === 'textured' && (
                  <div className='flex items-center justify-between py-1 mt-2'>
                    <p className='text-gray-600'>Textured finish</p>
                    <p className='font-medium text-gray-900'>
                      {formatPrice(PRODUCT_PRICES.finish.textured / 100)}
                    </p>
                  </div>
                )}

                {material === 'polycarbonate' && (
                  <div className='flex items-center justify-between py-1 mt-2'>
                    <p className='text-gray-600'>Soft polycarbonate material</p>
                    <p className='font-medium text-gray-900'>
                      {formatPrice(PRODUCT_PRICES.material.polycarbonate / 100)}
                    </p>
                  </div>
                )}
                
                <div className='flex items-center justify-between py-1 mt-2'>
                  <p className='text-gray-600'>Designer commission ({design.commissionRate}%)</p>
                  <p className='font-medium text-gray-900'>
                    {formatPrice((totalPrice * (design.commissionRate / 100)) / 100)}
                  </p>
                </div>
                
                <div className='flex items-center justify-between py-1 mt-2'>
                  <p className='text-gray-600'>Shop fee (10%)</p>
                  <p className='font-medium text-gray-900'>
                    {formatPrice((totalPrice * 0.1) / 100)}
                  </p>
                </div>

                <div className='my-2 h-px bg-gray-200' />

                <div className='flex items-center justify-between py-2'>
                  <p className='font-semibold text-gray-900'>Order total</p>
                  <p className='font-semibold text-gray-900'>
                    {formatPrice(sellingPrice / 100)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignDetailPage