
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const shops = await prisma.shop.findMany({
      select: {
        id: true,
        ShopName: true,
        country: true,
        image: true,
        rating: true,
      },
    });
    
    return NextResponse.json(shops);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
      { status: 500 }
    );
  }
}