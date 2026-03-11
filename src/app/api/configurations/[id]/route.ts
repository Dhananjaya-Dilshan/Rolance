import { NextResponse } from 'next/server'
import { db } from '@/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching configuration with ID:', params.id)
    
    const configuration = await db.configuration.findUnique({
      where: { id: params.id },
    })

    console.log('Database response:', configuration)

    if (!configuration) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(configuration)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}