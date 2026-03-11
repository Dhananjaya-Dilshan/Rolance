import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

// GET all shops
export async function GET(request: Request) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!await verifyAdmin(authHeader)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const shops = await prisma.shop.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ shops });
  } catch (error) {
    console.error('Error fetching shops:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}