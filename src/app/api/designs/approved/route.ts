// app/api/designs/approved/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const designs = await prisma.design.findMany({
      where: { status: 'approved' },
      include: {
        configuration: true,
      },
    });
    return NextResponse.json(designs);
  } catch (error) {
    console.error('Error fetching approved designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approved designs' },
      { status: 500 }
    );
  }
}