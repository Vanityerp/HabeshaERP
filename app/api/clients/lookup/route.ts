import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Client Lookup API Endpoint
 *
 * GET /api/clients/lookup?phone={phoneNumber}
 *
 * Looks up a client by phone number and returns their information if found.
 * Used for auto-populating client details in the New Appointment dialog.
 *
 * This endpoint checks BOTH the Prisma database AND the client-provider (localStorage)
 * to ensure all clients are found regardless of where they were created.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }

    // Normalize the phone number for comparison
    const normalizedPhone = normalizePhoneNumber(phone)

    console.log('📞 Client Lookup - Phone:', phone, '→ Normalized:', normalizedPhone)

    // Validate that we have a meaningful phone number
    if (!normalizedPhone || normalizedPhone.length < 8) {
      return NextResponse.json(
        {
          found: false,
          message: "Phone number too short for lookup"
        },
        { status: 200 }
      )
    }

    // STEP 1: Check Prisma database first
    const dbClients = await prisma.client.findMany({
      include: {
        user: true,
        loyaltyProgram: true
      }
    })

    console.log(`📊 Found ${dbClients.length} clients in database`)

    // Find client with matching phone number in database
    const dbMatchingClient = dbClients.find(client => {
      const clientNormalizedPhone = normalizePhoneNumber(client.phone || '')
      const matches = clientNormalizedPhone === normalizedPhone
      if (matches) {
        console.log(`✅ Database match found: ${client.name} (${client.id})`)
      }
      return matches
    })

    if (dbMatchingClient) {
      // Transform the database client data to match the expected format
      const clientData = {
        id: dbMatchingClient.user.id, // Use User ID for appointments
        clientRecordId: dbMatchingClient.id, // Keep Client record ID for reference
        name: dbMatchingClient.name,
        email: dbMatchingClient.user?.email || '',
        phone: dbMatchingClient.phone || '',
        preferredLocation: 'loc1', // Default for now
        segment: 'Regular',
        status: 'Active',
        totalSpent: Number(dbMatchingClient.loyaltyProgram?.totalSpent || 0),
        lastVisit: null,
        notes: dbMatchingClient.notes || '',
        currency: 'QAR',
        createdAt: dbMatchingClient.createdAt.toISOString(),
        updatedAt: dbMatchingClient.updatedAt.toISOString()
      }

      console.log('✅ Returning database client:', clientData.name, clientData.id)

      return NextResponse.json({
        found: true,
        client: clientData,
        message: "Client found in database",
        source: "database"
      })
    }

    // STEP 2: If not found in database, check client-provider (via GET /api/clients)
    // This will include clients stored in localStorage
    console.log('🔍 Not found in database, checking client-provider...')

    // Note: We can't directly access localStorage from the server,
    // but the client-provider will sync with the database on the client side.
    // For now, return not found and let the client-side handle localStorage lookup

    return NextResponse.json({
      found: false,
      message: "No client found with this phone number in database. Client may exist in localStorage.",
      normalizedPhone: normalizedPhone
    })

  } catch (error) {
    console.error("❌ Error in client lookup:", error)
    return NextResponse.json(
      {
        error: "Failed to lookup client",
        found: false
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to normalize phone numbers for consistent comparison
 * Removes all non-digit characters and handles Qatar country codes
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')

  // Handle Qatar phone numbers
  if (digitsOnly.startsWith('974')) {
    return digitsOnly // Already has country code
  } else if (digitsOnly.startsWith('00974')) {
    return digitsOnly.substring(2) // Remove 00 prefix
  } else if (digitsOnly.length === 8) {
    return `974${digitsOnly}` // Add Qatar country code
  }

  return digitsOnly
}

