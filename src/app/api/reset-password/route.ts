// app/api/reset-password/route.ts
import { NextResponse } from 'next/server'
import { resetPassword } from '@/lib/password-reset-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, newPassword, role } = body

    // Validate inputs
    if (!token || !newPassword || !role || (role !== 'shop' && role !== 'customer')) {
      return NextResponse.json(
        { message: 'Token, new password, and valid role are required' },
        { status: 400 }
      )
    }

    // Validate password strength (optional but recommended)
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Attempt to reset password
    const success = await resetPassword(token, newPassword, role)

    if (success) {
      return NextResponse.json(
        { message: 'Password reset successfully' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { message: 'Error processing password reset' },
      { status: 500 }
    )
  }
}