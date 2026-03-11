import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAdmin } from '@/lib/auth';

const prisma = new PrismaClient();

// GET a specific shop by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!await verifyAdmin(authHeader)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;

    // Find the shop by ID
    const shop = await prisma.shop.findUnique({
      where: { id },
    });

    if (!shop) {
      return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
    }

    return NextResponse.json({ shop });
  } catch (error) {
    console.error('Error fetching shop:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// UPDATE a specific shop by ID
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!await verifyAdmin(authHeader)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
    const body = await request.json();

    // Extract fields to update
    const { username, ShopName, email, ContactNumber, country, ShopAddress } = body;

    // Update the shop in the database
    const updatedShop = await prisma.shop.update({
      where: { id },
      data: {
        username,
        ShopName,
        email,
        ContactNumber,
        country,
        ShopAddress,
      },
    });

    return NextResponse.json(
      { message: 'Shop updated successfully', shop: updatedShop },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { message: 'Failed to update shop' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE a specific shop by ID
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!await verifyAdmin(authHeader)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;

    // Delete the shop from the database
    await prisma.shop.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Shop deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json(
      { message: 'Failed to delete shop' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}