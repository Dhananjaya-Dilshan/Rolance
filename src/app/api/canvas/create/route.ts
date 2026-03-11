import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, title, elements, lines, images } = body;

    // Validate required fields
    if (!customerId || !title) {
      return NextResponse.json(
        { error: "customerId and title are required" },
        { status: 400 }
      );
    }

    // Create the CanvasDesign
    const canvasDesign = await prisma.canvasDesign.create({
      data: {
        customerId,
        title,
        elements: elements || null,
        lines: lines || null,
        images: images || null,
      },
    });

    return NextResponse.json(canvasDesign, { status: 200 });
  } catch (error) {
    console.error("Error creating canvas design:", error);
    return NextResponse.json(
      { error: "Failed to create canvas design" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}