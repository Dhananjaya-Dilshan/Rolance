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

// PUT: Update a user by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const { id } = params;
    const body = await request.json();
    const { username, email, country } = body;

    // Update the user in the database
    const updatedUser = await prisma.customers.update({
      where: { id },
      data: {
        username,
        email,
        country,
      },
    });

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify admin token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const isAdmin = await verifyAdmin(token); // Ensure this function exists and works correctly
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Delete the user from the database
    await prisma.customers.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}