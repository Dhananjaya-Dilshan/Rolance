// app/api/customer/update/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secure-secret-key-here') as { userId: string; email: string; role: string };
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is a customer
    if (decoded.role !== 'customer') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Extract user data
    const body = await request.json();
    const { username, country, currentPassword, newPassword } = body;

    // Find the customer
    const customer = await prisma.customers.findFirst({
      where: { id: decoded.userId }
    });

    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      username,
      country
    };

    // Handle password change if requested
    if (currentPassword && newPassword) {
      // Verify current password
      const passwordValid = await bcrypt.compare(currentPassword, customer.password);
      if (!passwordValid) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update customer in database
    const updatedCustomer = await prisma.customers.update({
      where: { id: decoded.userId },
      data: updateData
    });

    // Remove password from response
    const { password, ...customerWithoutPassword } = updatedCustomer;

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: customerWithoutPassword
    }, { status: 200 });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({
      message: 'Error updating profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}