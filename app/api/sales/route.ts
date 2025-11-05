import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json({ error: "Location ID is required" }, { status: 400 })
    }

    console.log(`🔄 Fetching sales for location: ${locationId}`)

    const sales = await prisma.transaction.findMany({
      where: {
        locationId: locationId
      },
      include: {
        user: true,
        location: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${sales.length} sales for location`)
    return NextResponse.json({ sales })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (!data.locationId || !data.staffId || !data.items || !data.items.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const subtotal = data.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const taxAmount = data.taxAmount || 0
    const discountAmount = data.discountAmount || 0
    const tipAmount = data.tipAmount || 0
    const totalAmount = subtotal + taxAmount - discountAmount + tipAmount

    const sale = await prisma.transaction.create({
      data: {
        userId: data.staffId || data.clientId || "unknown",
        amount: totalAmount,
        type: "SALE",
        status: data.paymentStatus || "PENDING",
        method: data.paymentMethod || "CASH",
        reference: data.reference || null,
        description: data.notes || "Sale transaction",
        locationId: data.locationId,
        appointmentId: data.appointmentId || null,
        serviceAmount: data.serviceAmount || null,
        productAmount: data.productAmount || null,
        originalServiceAmount: subtotal,
        discountPercentage: data.discountPercentage || null,
        discountAmount: discountAmount,
        items: JSON.stringify(data.items)
      },
      include: {
        user: true,
        location: true
      }
    })

    return NextResponse.json({
      success: true,
      sale,
    })
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}