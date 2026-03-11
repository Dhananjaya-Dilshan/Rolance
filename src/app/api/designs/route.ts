// app/api/designs/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-secret-key-here';

export async function GET(request: Request) {
  try {
    // Extract token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if it's an admin or a regular user
    if (decoded.role === 'admin') {
      // If admin, fetch all designs
      const designs = await prisma.design.findMany({
        include: {
          configuration: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return NextResponse.json(designs);
    } else if (decoded.role === 'customer' || decoded.role === 'shop') {
      // If customer or shop, fetch designs for the specific user
      const designs = await prisma.design.findMany({
        where: {
          customerId: decoded.userId
        },
        include: {
          configuration: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return NextResponse.json(designs);
    } else {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Extract token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Only admin can update design status
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to update design status' },
        { status: 403 }
      );
    }

    const { id, status } = await request.json();

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update the design status
    const updatedDesign = await prisma.design.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedDesign);
  } catch (error) {
    console.error('Error updating design:', error);
    return NextResponse.json(
      { error: 'Failed to update design' },
      { status: 500 }
    );
  }
}