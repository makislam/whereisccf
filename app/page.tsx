import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { LoginButton } from '@/components/LoginButton'
import { UserForm } from '@/components/UserForm'
import { WorldMap } from '@/components/WorldMap'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Where is CCF?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Track where CCF members are across the globe
            </p>
            <LoginButton />
          </div>
        </div>
      </div>
    )
  }

  // Check if user has completed their profile
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user?.id }
  })

  // Get all profiles for the map
  const profiles = await prisma.profile.findMany({
    include: {
      user: {
        select: {
          name: true,
          image: true
        }
      }
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Where is CCF?</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {session.user?.name}</span>
              <LoginButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {!profile ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Complete Your Profile
              </h2>
              <p className="text-gray-600 mb-6">
                Please fill out your information to be added to the map.
              </p>
              <UserForm />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                CCF Members Around the World
              </h2>
              <p className="text-gray-600">
                {profiles.length} members have shared their locations
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <WorldMap profiles={profiles} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
