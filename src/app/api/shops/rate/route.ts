import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET not configured');

export async function POST(request: Request) {
  try {
    // Authentication check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    // Update this to match what's in your login route
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    // Role validation
    if (decoded.role !== 'customer') {
      return NextResponse.json({ message: 'Only customers can rate shops' }, { status: 403 });
    }

    // Parse and validate request
    const body = await request.json();
    if (!body?.shopId || typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    // Check shop existence
    const shop = await prisma.shop.findUnique({ where: { id: body.shopId } });
    if (!shop) return NextResponse.json({ message: 'Shop not found' }, { status: 404 });

    // Upsert rating - use userId from token instead of customerId
    await prisma.shopRating.upsert({
      where: { shopId_customerId: { shopId: body.shopId, customerId: decoded.userId } },
      update: { rating: body.rating },
      create: { shopId: body.shopId, customerId: decoded.userId, rating: body.rating },
    });

    // Calculate new average
    const average = await prisma.shopRating.aggregate({
      where: { shopId: body.shopId },
      _avg: { rating: true },
    });

    // Update shop rating
    await prisma.shop.update({
      where: { id: body.shopId },
      data: { rating: average._avg.rating },
    });

    return NextResponse.json({ 
      success: true, 
      averageRating: average._avg.rating 
    });

  } catch (error) {
    console.error('Rating error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}