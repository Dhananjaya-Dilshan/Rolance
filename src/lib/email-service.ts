// lib/email-service.ts
import nodemailer from 'nodemailer'
import { Order, Configuration, customers } from '@prisma/client'
import { 
  createOrderAcceptanceEmailTemplate, 
  createOrderRejectionEmailTemplate 
} from './email-templates'

// Create a transporter using SMTP
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

// Enhanced type to include more detailed configuration
type OrderWithFullDetails = Order & {
  configuration: Configuration & { 
    color: string 
    model: string 
    material: string 
    finish: string 
    width: number
    height: number
  },
  customer: customers
}

export async function sendOrderAcceptanceEmail(order: OrderWithFullDetails) {
  // Validate required fields
  if (!order.customer.email) {
    console.error('No email address found for customer')
    return false
  }

  try {
    // Verify transporter connection
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('SMTP Connection Error:', error)
          reject(error)
        } else {
          resolve(success)
        }
      })
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Phone Case Shop" <${process.env.SMTP_USER}>`,
      to: order.customer.email,
      subject: 'Order Acceptance Confirmation',
      html: createOrderAcceptanceEmailTemplate(order)
    }

    // Send email with additional timeout
    const info = await transporter.sendMail(mailOptions)
    console.log(`Acceptance email sent to ${order.customer.email}. Message ID: ${info.messageId}`)
    return true
  } catch (error) {
    console.error('Failed to send acceptance email:', error)
    
    // Log specific error details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
    }
    
    return false
  }
}

export async function sendOrderRejectionEmail(order: OrderWithFullDetails) {
  // Validate required fields
  if (!order.customer.email) {
    console.error('No email address found for customer')
    return false
  }

  try {
    // Verify transporter connection
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('SMTP Connection Error:', error)
          reject(error)
        } else {
          resolve(success)
        }
      })
    })

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Phone Case Shop" <${process.env.SMTP_USER}>`,
      to: order.customer.email,
      subject: 'Order Rejection Notification',
      html: createOrderRejectionEmailTemplate(order)
    }

    // Send email with additional timeout
    const info = await transporter.sendMail(mailOptions)
    console.log(`Rejection email sent to ${order.customer.email}. Message ID: ${info.messageId}`)
    return true
  } catch (error) {
    console.error('Failed to send rejection email:', error)
    
    // Log specific error details
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
    }
    
    return false
  }
}