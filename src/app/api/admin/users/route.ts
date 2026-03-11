import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Verify admin token
const verifyAdmin = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secure-secret-key") as {
      role: string;
    };
    return decoded.role === "admin"; // Ensure the role is "admin"
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
};

// GET all users
export async function GET(request: Request) {
  try {
    // Verify admin token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const isAdmin = verifyAdmin(token); // Verify the token and role
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch all users
    const users = await prisma.customers.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}