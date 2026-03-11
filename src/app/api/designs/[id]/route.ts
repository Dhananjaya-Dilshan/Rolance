// app/api/designs/[id]/route.ts
import { db } from '@/db'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const design = await db.design.findUnique({
      where: { id: params.id, status: 'approved' },
      include: {
        configuration: true,
      },
    })

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 })
    }

    return NextResponse.json(design)
  } catch (error) {
    console.error('Error fetching design:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // First, check if the design exists
    const existingDesign = await prisma.design.findUnique({
      where: { id }
    });

    if (!existingDesign) {
      return NextResponse.json(
        { error: 'Design not found' },
        { status: 404 }
      );
    }

    // Delete the design
    await prisma.design.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Design deleted successfully' });
  } catch (error) {
    console.error('Error deleting design:', error);
    return NextResponse.json(
      { error: 'Failed to delete design' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate input
    const { title, description, tags, commissionRate } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Update the design
    const updatedDesign = await prisma.design.update({
      where: { id },
      data: {
        title,
        description,
        tags: tags || [], // Ensure tags is an array
        commissionRate: commissionRate || 0
      },
      include: {
        configuration: true
      }
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