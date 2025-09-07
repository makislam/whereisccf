import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, program, graduationYear, currentTerm, location, latitude, longitude } = body

    // Create or update the user's profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        name,
        program,
        graduationYear: graduationYear || null,
        currentTerm: currentTerm || null,
        location,
        latitude,
        longitude,
      },
      create: {
        userId: session.user.id,
        name,
        program,
        graduationYear: graduationYear || null,
        currentTerm: currentTerm || null,
        location,
        latitude,
        longitude,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
