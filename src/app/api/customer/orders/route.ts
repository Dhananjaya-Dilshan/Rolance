import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-secret-key-here'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string, 
      role: string 
    }

    if (decoded.role !== 'customer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orders = await prisma.order.findMany({
      where: { customerId: decoded.userId },
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
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
    
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}