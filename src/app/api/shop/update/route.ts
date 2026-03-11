// app/api/shop/update/route.ts
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

    // Check if user is a shop owner
    if (decoded.role !== 'shop') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Extract user data
    const body = await request.json();
    const { username, country, ShopName, ShopAddress, ContactNumber, currentPassword, newPassword, image } = body;

    // Find the shop
    const shop = await prisma.shop.findFirst({
      where: { id: decoded.userId }
    });

    if (!shop) {
      return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      username,
      country,
      ShopName,
      ShopAddress,
      ContactNumber,
      image
    };

    // Handle password change if requested
    if (currentPassword && newPassword) {
      // Verify current password
      const passwordValid = await bcrypt.compare(currentPassword, shop.password);
      if (!passwordValid) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update shop in database
    const updatedShop = await prisma.shop.update({
      where: { id: decoded.userId },
      data: updateData
    });

    // Remove password from response
    const { password, ...shopWithoutPassword } = updatedShop;

    return NextResponse.json({
      message: 'Shop profile updated successfully',
      user: shopWithoutPassword
    }, { status: 200 });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({
      message: 'Error updating shop profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}