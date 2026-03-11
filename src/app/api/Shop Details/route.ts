import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to get shop email from token
const getShopEmailFromToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { email: string };
    console.log('Decoded token:', decoded);
    return decoded.email;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// GET route to fetch shop details
export async function GET(request: NextRequest) {
  try {
    // Get and validate token
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ 
        message: 'Unauthorized - No token provided',
        debug: { authHeader }
      }, { status: 401 });
    }

    // Get shop email from token
    const shopEmail = getShopEmailFromToken(token);
    console.log('Shop email from token:', shopEmail);
    
    if (!shopEmail) {
      return NextResponse.json({ 
        message: 'Unauthorized - Invalid token',
        debug: { token: token.substring(0, 15) + '...' }
      }, { status: 401 });
    }

    // Fetch shop from database
    const shop = await prisma.shop.findUnique({
      where: { email: shopEmail },
      select: {
        username: true,
        email: true,
        country: true,
        ShopName: true,
        ContactNumber: true,
      }
    });

    console.log('Shop lookup result:', shop);

    if (!shop) {
      return NextResponse.json({ 
        message: 'Shop not found',
        debug: { 
          shopEmail,
          tokenPreview: token.substring(0, 15) + '...'
        }
      }, { status: 404 });
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error('Error in GET /api/shop:', error);
    return NextResponse.json({
      message: 'Internal server error',
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}