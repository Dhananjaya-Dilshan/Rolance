import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { sendOrderRejectionEmail, sendOrderAcceptanceEmail } from '@/lib/email-service'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-secret-key-here'

export async function PATCH(
  req: NextRequest, 
  { params }: { params: { orderId: string } }
) {
  try {
    // 1. Verify shop authentication
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Decode and verify token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { 
        userId: string, 
        role: string 
      }
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 3. Ensure only shop can update
    if (decoded.role !== 'shop') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 4. Parse request body
    const { status } = await req.json()

    // 5. Fetch the order with full details
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        configuration: true,
        customer: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 6. Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.orderId },
      data: { status }
    })

    // 7. Handle email notifications
    if (status === 'rejected') {
      try {
        const emailSent = await sendOrderRejectionEmail(order as any)
        
        if (!emailSent) {
          console.warn('Rejection email sending failed for order')
        }
      } catch (emailError) {
        console.error('Error in rejection email sending process:', emailError)
      }
    } else if (status === 'shipped') {
      try {
        const emailSent = await sendOrderAcceptanceEmail(order as any)
        
        if (!emailSent) {
          console.warn('Acceptance email sending failed for order')
        }
      } catch (emailError) {
        console.error('Error in acceptance email sending process:', emailError)
      }
    }

    return NextResponse.json(updatedOrder)
    
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}