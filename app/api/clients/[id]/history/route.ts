import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await context.params

    // Get client from database to access userId
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        userId: true,
        name: true,
        email: true,
        phone: true
      }
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    console.log(`📋 Fetching history for client: ${client.name} (ID: ${clientId}, UserID: ${client.userId})`)

    // Get client appointments from Prisma using userId
    // Note: Appointment.clientId references User.id, not Client.id
    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: client.userId // Use userId from client
      },
      include: {
        staff: true,
        location: true,
        services: {
          include: {
            service: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    console.log(`✅ Found ${appointments.length} appointments for ${client.name}`)

    // Get client purchases/transactions from the database
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: client.userId,
        type: {
          in: ['PRODUCT_SALE', 'SERVICE_SALE', 'PACKAGE_SALE', 'CONSOLIDATED_SALE']
        }
      },
      include: {
        location: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${transactions.length} transactions for ${client.name}`)

    // Also check for transactions by client name in description (fallback)
    // This helps find transactions that might have been created before userId was properly set
    const transactionsByName = await prisma.transaction.findMany({
      where: {
        description: {
          contains: client.name,
          mode: 'insensitive'
        },
        type: {
          in: ['PRODUCT_SALE', 'SERVICE_SALE', 'PACKAGE_SALE', 'CONSOLIDATED_SALE']
        }
      },
      include: {
        location: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${transactionsByName.length} additional transactions by name for ${client.name}`)

    // Merge transactions (remove duplicates by ID)
    const allTransactions = [...transactions]
    transactionsByName.forEach(tx => {
      if (!allTransactions.find(t => t.id === tx.id)) {
        allTransactions.push(tx)
      }
    })

    console.log(`📊 Total unique transactions: ${allTransactions.length}`)

    // Transform transactions to purchase format
    const purchases = allTransactions.map(transaction => {
      let items = []
      try {
        items = transaction.items ? JSON.parse(transaction.items) : []
      } catch (error) {
        console.error('Error parsing transaction items:', error)
      }

      return {
        id: transaction.id,
        date: transaction.createdAt.toISOString(),
        type: "purchase",
        description: transaction.description || "Purchase",
        amount: Number(transaction.amount),
        paymentMethod: transaction.method,
        transactionId: transaction.reference || transaction.id,
        items: items
      }
    })

    // Transform appointments to timeline format
    const appointmentEvents = appointments.map(appointment => ({
      id: appointment.id,
      date: appointment.date.toISOString(),
      type: "appointment",
      title: appointment.services.map(s => s.service.name).join(", ") || "Service",
      description: `with ${appointment.staff.name}`,
      status: appointment.status.toLowerCase(),
      amount: Number(appointment.totalPrice),
      location: appointment.location.name,
      bookingReference: appointment.bookingReference,
      duration: appointment.duration,
      notes: appointment.notes,
      icon: "Scissors",
      color: getAppointmentStatusColor(appointment.status)
    }))

    // Transform purchases to timeline format
    const purchaseEvents = purchases.map(purchase => ({
      id: purchase.id,
      date: purchase.date,
      type: "purchase",
      title: "Product Purchase",
      description: purchase.description,
      amount: purchase.amount,
      paymentMethod: purchase.paymentMethod,
      transactionId: purchase.transactionId,
      items: purchase.items,
      icon: "ShoppingBag",
      color: "bg-green-100 text-green-800"
    }))

    // Add some communication events (mock for now)
    const communicationEvents = [
      {
        id: `c1-${clientId}`,
        date: "2025-03-10T09:15:00",
        type: "communication",
        title: "SMS Reminder",
        description: "Appointment reminder sent",
        status: "delivered",
        icon: "MessageSquare",
        color: "bg-blue-100 text-blue-800"
      },
      {
        id: `c2-${clientId}`,
        date: "2025-02-25T11:30:00",
        type: "communication",
        title: "Email Newsletter",
        description: "Monthly beauty tips newsletter",
        status: "opened",
        icon: "Mail",
        color: "bg-blue-100 text-blue-800"
      }
    ]

    // Add some notes (mock for now)
    const noteEvents = [
      {
        id: `n1-${clientId}`,
        date: "2025-02-20T11:00:00",
        type: "note",
        title: "Stylist Note",
        description: "Client prefers cooler tones for highlights",
        addedBy: "Sarah Johnson",
        icon: "AlertCircle",
        color: "bg-purple-100 text-purple-800"
      }
    ]

    // Combine all events and sort by date
    const allEvents = [
      ...appointmentEvents,
      ...purchaseEvents,
      ...communicationEvents,
      ...noteEvents
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      appointments: appointmentEvents,
      purchases: purchaseEvents,
      communications: communicationEvents,
      notes: noteEvents,
      timeline: allEvents,
      summary: {
        totalAppointments: appointmentEvents.length,
        totalPurchases: purchaseEvents.length,
        totalSpent: [...appointmentEvents, ...purchaseEvents].reduce((sum, event) => sum + (event.amount || 0), 0),
        lastVisit: appointmentEvents.length > 0 ? appointmentEvents[0].date : null,
        lastPurchase: purchaseEvents.length > 0 ? purchaseEvents[0].date : null
      }
    })

  } catch (error) {
    console.error("Error fetching client history:", error)
    return NextResponse.json({ error: "Failed to fetch client history" }, { status: 500 })
  }
}

// Helper function to get appointment status color
function getAppointmentStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "checked_in":
      return "bg-purple-100 text-purple-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}