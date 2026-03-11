import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, shopName, country, contactNumber, shopAddress } = body;

    // Validate required fields
    if (!email || !password || !name || !role || !country) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists in either customers or shop table
    const existingCustomer = await prisma.customers.findFirst({ 
      where: { email } 
    });
    
    const existingShop = await prisma.shop.findFirst({ 
      where: { email } 
    });

    if (existingCustomer || existingShop) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === 'customer') {
      // Create customer
      user = await prisma.customers.create({
        data: {
          username: name,
          email,
          password: hashedPassword,
          country,
        },
      });
    } else if (role === 'shop') {
      // Validate shop-specific fields
      if (!shopName || !contactNumber|| !shopAddress) {
        return NextResponse.json(
          { message: 'Shop name, contact number, and address are required for shop registration' },
          { status: 400 }
        );
      }

      // Create shop
      user = await prisma.shop.create({
        data: {
          username: name,
          email,
          password: hashedPassword,
          country,
          ShopName: shopName,
          ContactNumber: contactNumber,
          ShopAddress: shopAddress,
        },
      });
    } else {
      return NextResponse.json(
        { message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Registration successful',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      message: 'Error creating user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}