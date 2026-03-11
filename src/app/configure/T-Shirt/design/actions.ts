'use server'

import { db } from '@/db'
import { stripe } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { Order } from '@prisma/client'
import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products'

// Define types for saving T-shirt TSHIRTConfiguration
export type SaveConfigArgs = {
  color: string
  finish: string // Assuming CaseFinish-like enum isn't needed; using string directly
  material: string // Assuming CaseMaterial-like enum isn't needed
  size: string // Replacing PhoneModel with size
  configId: string
  productType?: string
}

export async function saveConfig({
  color,
  finish,
  material,
  size,
  configId,
  productType = 'tshirt',
}: SaveConfigArgs) {
  try {
    await db.TSHIRTConfiguration.update({
      where: { id: configId },
      data: {
        color,
        finish,
        material,
        size, // Updated from model to size
        productType,
      },
    })
  } catch (error) {
    console.error('Error saving TSHIRTConfiguration:', error)
    throw new Error('Failed to save T-shirt TSHIRTConfiguration')
  }
}

export const createCheckoutSession = async ({
  configId,
}: {
  configId: string
}) => {
  // Fetch the TSHIRTConfiguration
  const TSHIRTConfiguration = await db.TSHIRTConfiguration.findUnique({
    where: { id: configId },
  })

  if (!TSHIRTConfiguration) {
    throw new Error('No such TSHIRTConfiguration found')
  }

  // Get authenticated user
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    throw new Error('You need to be logged in')
  }

  const { finish, material } = TSHIRTConfiguration

  // Calculate price based on material and finish
  let price = BASE_PRICE
  if (finish === 'premium') price += PRODUCT_PRICES.finish.premium || 300 // Fallback to 300 cents ($3)
  if (material === 'polyester') price += PRODUCT_PRICES.material.polyester || 200 // Fallback to 200 cents ($2)

  let order: Order | undefined = undefined

  // Check for existing order
  const existingOrder = await db.order.findFirst({
    where: {
      userId: user.id,
      TSHIRTConfigurationId: TSHIRTConfiguration.id,
    },
  })

  if (existingOrder) {
    order = existingOrder
  } else {
    order = await db.order.create({
      data: {
        amount: price / 100, // Convert cents to dollars
        userId: user.id,
        TSHIRTConfigurationId: TSHIRTConfiguration.id,
      },
    })
  }

  // Create Stripe product
  const product = await stripe.products.create({
    name: 'Custom T-Shirt',
    images: [TSHIRTConfiguration.imageUrl], // Assuming front image; extend for back if needed
    default_price_data: {
      currency: 'USD',
      unit_amount: price,
    },
  })

  // Create Stripe checkout session
  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/TShirt/preview?id=${TSHIRTConfiguration.id}`,
    payment_method_types: ['card', 'paypal'],
    mode: 'payment',
    shipping_address_collection: { allowed_countries: ['DE', 'US'] },
    metadata: {
      userId: user.id,
      orderId: order.id,
    },
    line_items: [{ price: product.default_price as string, quantity: 1 }],
  })

  return { url: stripeSession.url }
}