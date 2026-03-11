// lib/email-templates.ts
import { Order, Configuration, customers } from '@prisma/client'

// Type for order with full details
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

// Utility function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Base email template with common styling
const baseEmailTemplate = (content: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
    <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      ${content}
    </div>
  </div>
`

// Order acceptance email template
export const createOrderAcceptanceEmailTemplate = (order: OrderWithFullDetails) => {
  const content = `
    <h2 style="color: #28a745; border-bottom: 2px solid #eee; padding-bottom: 10px;">Order Accepted</h2>
    
    <p>Dear ${order.customer.username},</p>
    
    <p>Great news! Your order has been accepted and is now being processed.</p>
    
    <h3>Order Details:</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order ID:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.id}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${formatCurrency(order.amount)}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone Model:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.configuration.model}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Case Material:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.configuration.material}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Case Finish:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.configuration.finish}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Case Color:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.configuration.color}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Dimensions:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.configuration.width}mm x ${order.configuration.height}mm</td>
      </tr>
    </table>
    
    <p>Our team is working diligently to prepare your order for shipping. We'll send you another notification once it's shipped.</p>
    
    <p style="color: #666;">Thank you for your purchase!<br>Phone Case Shop Team</p>
  `

  return baseEmailTemplate(content)
}

// Order rejection email template
export const createOrderRejectionEmailTemplate = (order: OrderWithFullDetails) => {
  const content = `
    <h2 style="color: #d9534f; border-bottom: 2px solid #eee; padding-bottom: 10px;">Order Rejection Notice</h2>
    
    <p>Dear ${order.customer.username},</p>
    
    <p>We regret to inform you that your recent order has been rejected.</p>
    
    <h3>Order Details:</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order ID:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.id}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${formatCurrency(order.amount)}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone Model:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.configuration.model}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Case Material:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.configuration.material}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Case Finish:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.configuration.finish}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Case Color:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.configuration.color}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Dimensions:</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">${order.configuration.width}mm x ${order.configuration.height}mm</td>
      </tr>
    </table>
    
    <p>If you have any questions about this rejection, please contact our customer support.</p>
    
    <p style="color: #666;">Best regards,<br>Phone Case Shop Team</p>
  `

  return baseEmailTemplate(content)
}