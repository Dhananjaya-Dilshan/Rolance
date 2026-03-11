'use server'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-secret-key-here'

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token missing' },
        { status: 401 }
      )
    }

    // 2. Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { 
        userId: string, 
        role: string,
        email: string
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // 3. Validate customer role
    if (decoded.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can place orders' },
        { status: 403 }
      )
    }

    // 4. Get request data
    const { shopId, configurationId } = await req.json()
    
    if (!shopId || !configurationId) {
      return NextResponse.json(
        { error: 'Missing shopId or configurationId' },
        { status: 400 }
      )
    }

    // 5. Get customer
    const customer = await prisma.customers.findUnique({
      where: { id: decoded.userId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // 6. Get configuration
    const configuration = await prisma.configuration.findUnique({
      where: { id: configurationId }
    })

    if (!configuration) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      )
    }

    // 7. Calculate price
    let amount = BASE_PRICE
    if (configuration.finish === 'textured') amount += PRODUCT_PRICES.finish.textured
    if (configuration.material === 'polycarbonate') amount += PRODUCT_PRICES.material.polycarbonate

    // 8. Create order
    const order = await prisma.order.create({
      data: {
        configurationId,
        shopId,
        customerId: decoded.userId, // Use customer ID from token
        amount: amount / 100,
        status: 'awaiting_shipment'
      }
    })

    return NextResponse.json(order)

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}