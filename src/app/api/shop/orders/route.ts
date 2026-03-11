import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-secret-key-here'

export async function GET(req: NextRequest) {
  try {
    // Verify shop authentication
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string, 
      role: string 
    }

    if (decoded.role !== 'shop') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch shop's orders with related data

const orders = await prisma.order.findMany({
  where: { shopId: decoded.userId },
  include: {
    configuration: {
      select: {
        color: true,
        model: true,
        material: true,
        finish: true,
        croppedImageUrl: true,
        width: true,
        height: true
      }
    },
    customer: {
      select: {
        username: true
      }
    }
  },
  orderBy: { createdAt: 'desc' }
})

    return NextResponse.json(orders)
    
  } catch (error) {
    console.error('Error fetching shop orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}