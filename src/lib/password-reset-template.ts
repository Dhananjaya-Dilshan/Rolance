
// lib/password-reset-template.ts
import { shop, customers } from '@prisma/client'

// Extended type to include role
type UserWithRole = (shop | customers) & { role: 'shop' | 'customer' }

export const createPasswordResetEmailTemplate = (user: UserWithRole, resetLink: string) => {
  const content = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #6b46c1; border-bottom: 2px solid #eee; padding-bottom: 10px;">Password Reset Request</h2>
        
        <p>Dear ${user.username},</p>
        
        <p>You have requested to reset your password for your Phone Case Shop ${user.role} account. Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetLink}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #6b46c1;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          ">Reset Password</a>
        </div>
        
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        
        <p>This link will expire in 1 hour.</p>
        
        <p style="color: #666; font-size: 0.9em;">
          If the button above doesn't work, copy and paste this link in your browser:<br>
          ${resetLink}
        </p>
        
        <p style="color: #666;">Best regards,<br>Phone Case Shop Team</p>
      </div>
    </div>
  `

  return content
}
