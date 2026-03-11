// lib/password-reset-service.ts
import { PrismaClient, shop, customers } from '@prisma/client'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'
import { createPasswordResetEmailTemplate } from './password-reset-template'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Create a transporter using SMTP (reuse from email-service)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
})

// Type for user (either shop or customer)
type User = shop | customers

export async function generatePasswordResetToken(email: string, role: 'shop' | 'customer') {
  try {
    // Find user based on role
    let user: User | null = null;
    if (role === 'shop') {
      user = await prisma.shop.findFirst({
        where: { email }
      })
    } else if (role === 'customer') {
      user = await prisma.customers.findFirst({
        where: { email }
      })
    }

    // If no user found, return null
    if (!user) {
      return null
    }

    // Generate a unique reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Update user with reset token and expiry
    if (role === 'shop') {
      await prisma.shop.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      })
    } else {
      await prisma.customers.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      })
    }

    // Construct reset link (adjust the URL as needed for your application)
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&role=${role}`

    // Send reset email
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Phone Case Shop" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: createPasswordResetEmailTemplate({
        ...user,
        role
      }, resetLink)
    }

    await transporter.sendMail(mailOptions)

    return resetToken
  } catch (error) {
    console.error('Password reset token generation error:', error instanceof Error ? error.message : error)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

export async function resetPassword(token: string, newPassword: string, role: 'shop' | 'customer') {
  try {
    // Find user with matching token that hasn't expired
    let user: User | null = null;
    if (role === 'shop') {
      user = await prisma.shop.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date() // Token is still valid
          }
        }
      })
    } else {
      user = await prisma.customers.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date() // Token is still valid
          }
        }
      })
    }

    if (!user) {
      return false
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password and clear reset token
    if (role === 'shop') {
      await prisma.shop.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      })
    } else {
      await prisma.customers.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      })
    }

    return true
  } catch (error) {
    console.error('Password reset error:', error instanceof Error ? error.message : error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}