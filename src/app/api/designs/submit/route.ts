import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { configurationId, title, description, tags, commissionRate } = await req.json()

    // Get the user from the request headers or body
    const userTokenString = req.headers.get('Authorization')?.split('Bearer ')[1]
    
    if (!userTokenString) {
      return NextResponse.json(
        { error: 'No user token provided' },
        { status: 401 }
      )
    }

    // Parse the user object
    let user;
    try {
      user = JSON.parse(userTokenString)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid user token' },
        { status: 401 }
      )
    }

    const design = await prisma.design.create({
      data: {
        configurationId,
        title,
        description,
        tags: tags, // Ensure tags is an array
        commissionRate,
        status: 'pending', // Default status
        customerId: user.id, // Add the customer ID from the parsed user object
      },
    })

    return NextResponse.json(design)
  } catch (error) {
    console.error('Error submitting design:', error)
    return NextResponse.json(
      { error: 'Failed to submit design' },
      { status: 500 }
    )
  }
}