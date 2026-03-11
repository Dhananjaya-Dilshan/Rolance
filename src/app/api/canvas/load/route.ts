import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  try {
    const share = await prisma.canvasDesignShare.findUnique({
      where: { token },
      include: { 
        canvas: {
          include: {
            customer: true
          }
        } 
      },
    });

    if (!share) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
    }

    return NextResponse.json(
      {
        canvas: share.canvas,
        permission: share.permission,
        shareEmail: share.email  // Include permission for authorization check
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load canvas design" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}