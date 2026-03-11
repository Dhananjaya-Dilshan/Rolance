import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Make sure to set this in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secure-secret-key-here';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    // Check for admin login
    if (email === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { 
          role: 'admin',
          email: process.env.ADMIN_USERNAME,
          isAdmin: true
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        message: 'Login successful',
        user: { email: process.env.ADMIN_USERNAME, role: 'admin' },
        token
      }, { status: 200 });
    }

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { message: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Find user based on role
    let user;
    if (role === 'customer') {
      user = await prisma.customers.findFirst({
        where: { email }
      });
    } else if (role === 'shop') {
      user = await prisma.shop.findFirst({
        where: { email }
      });
    } else {
      return NextResponse.json(
        { message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      message: 'Error during login',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}