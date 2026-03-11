import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { token, designData, userEmail } = await request.json();

    if (!token || !designData) {
      return NextResponse.json(
        { error: "Token and designData are required" },
        { status: 400 }
      );
    }

    // Find the share record and include the canvas with customer info
    const share = await prisma.canvasDesignShare.findUnique({
      where: { token },
      include: {
        canvas: {
          include: {
            customer: true
          }
        }
      }
    });

    if (!share) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    // Verify permission - either original owner or shared with edit permission and matching email
    const isOwner = share.canvas.customerId === userEmail; // Assuming userEmail is the customerId
    const hasEditPermission = share.permission === "edit" && share.email === userEmail;

    if (!isOwner && !hasEditPermission) {
      return NextResponse.json({ error: "No edit permission" }, { status: 403 });
    }

    const updatedDesign = await prisma.canvasDesign.update({
      where: { id: share.canvasId },
      data: {
        elements: designData.elements,
        lines: designData.lines,
        images: designData.images,
        metadata: {
          bgColor: designData.bgColor,
          gradient: designData.gradient
        },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Canvas design updated", design: updatedDesign },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update canvas design" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}