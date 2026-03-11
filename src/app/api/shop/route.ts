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
        ShopRatings: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate the actual rating for each shop
    const processedShops = shops.map(shop => ({
      ...shop,
      rating: shop.ShopRatings.length
        ? shop.ShopRatings.reduce((sum, r) => sum + r.rating, 0) / shop.ShopRatings.length
        : 0,
    }));

    return NextResponse.json(processedShops);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
  }
}
