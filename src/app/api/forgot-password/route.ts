// app/api/forgot-password/route.ts
import { NextResponse } from 'next/server'
import { generatePasswordResetToken } from '@/lib/password-reset-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, role } = body

    // Validate email and role
    if (!email || !role || (role !== 'shop' && role !== 'customer')) {
      return NextResponse.json(
        { message: 'Email and valid role are required' },
        { status: 400 }
      )
    }

    // Generate and send reset token
    const resetToken = await generatePasswordResetToken(email, role)

    if (!resetToken) {
      return NextResponse.json(
        { message: 'Unable to generate reset token. Email may not exist.' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Password reset link sent to your email' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Error processing password reset request' },
      { status: 500 }
    )
  }
}