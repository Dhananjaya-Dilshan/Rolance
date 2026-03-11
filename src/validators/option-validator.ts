// bg-blue-950 border-blue-950
// bg-zinc-900 border-zinc-900
// bg-rose-950 border-rose-950

import { PRODUCT_PRICES } from '@/config/products'

export const COLORS = [
  { label: 'Black', value: 'black', tw: 'zinc-900' },
  {
    label: 'Blue',
    value: 'blue',
    tw: 'blue-950',
  },
  { label: 'Rose', value: 'rose', tw: 'rose-950' },
] as const

export const MODELS = {
  name: 'models',
  options: [
    {
      label: 'iPhone X',
      value: 'iphonex',
    },
    {
      label: 'iPhone 11',
      value: 'iphone11',
    },
    {
      label: 'iPhone 12',
      value: 'iphone12',
    },
    {
      label: 'iPhone 13',
      value: 'iphone13',
    },
    {
      label: 'Honor x7b',
      value: 'honorx7b',
    },
    {
      label: 'Samsung S24 Ultra',
      value: 'SamsungS24Ultra',
    },
  ],
} as const

export const MATERIALS = {
  name: 'material',
  options: [
    {
      label: 'Silicone',
      value: 'silicone',
      description: undefined,
      price: PRODUCT_PRICES.material.silicone,
    },
    {
      label: 'Soft Polycarbonate',
      value: 'polycarbonate',
      description: 'Scratch-resistant coating',
      price: PRODUCT_PRICES.material.polycarbonate,
    },
  ],
} as const

export const FINISHES = {
  name: 'finish',
  options: [
    {
      label: 'Smooth Finish',
      value: 'smooth',
      description: undefined,
      price: PRODUCT_PRICES.finish.smooth,
    },
    {
      label: 'Textured Finish',
      value: 'textured',
      description: 'Soft grippy texture',
      price: PRODUCT_PRICES.finish.textured,
    },
  ],
} as const
export const TSHIRT_MATERIALS = {
  name: 'material',
  options: [
    { label: 'Cotton', value: 'cotton', description: 'Soft and breathable', price: 0 },
    { label: 'Polyester', value: 'polyester', description: 'Durable and lightweight', price: 200 }, 
  ],
} as const;

export const TSHIRT_FINISHES = {
  name: 'finish',
  options: [
    { label: 'Standard Print', value: 'standard', description: undefined, price: 0 },
    { label: 'Premium Print', value: 'premium', description: 'Vivid colors', price: 300 }, 
  ],
} as const;

export const TSHIRT_SIZES = {
  name: 'sizes',
  options: [
    { label: 'Small', value: 'S' },
    { label: 'Medium', value: 'M' },
    { label: 'Large', value: 'L' },
    { label: 'X-Large', value: 'XL' },
  ],
} as const;


export const TSHIRT_COLORS = [
  { label: 'Black', value: 'black', tw: 'zinc-900' },
  { label: 'White', value: 'white', tw: 'white' },
  { label: 'Gray', value: 'gray', tw: 'gray-500' },
] as const;