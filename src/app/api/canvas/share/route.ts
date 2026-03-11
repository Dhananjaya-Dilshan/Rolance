import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { canvasId, emails } = await request.json();

    if (!canvasId || !emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: "canvasId and emails array are required" },
        { status: 400 }
      );
    }

    const shares = await Promise.all(
      emails.map(async (email) => {
        const token = uuidv4();
        return prisma.canvasDesignShare.create({
          data: { canvasId, email, permission: "edit", token },
        });
      })
    );

    const shareLinks = shares.map(
      (share) => `${process.env.NEXT_PUBLIC_SERVER_URL}/Design_Canvas?token=${share.token}`
    );
    return NextResponse.json({ links: shareLinks }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create share links" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}