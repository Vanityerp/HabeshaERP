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

    const sales = await prisma.sale.findMany({
      where: {
        locationId: locationId
      },
      include: {
        client: true,
        staff: true,
        location: true,
        items: {
          include: {
            product: true,
            service: true
          }
        }
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

    const sale = await prisma.sale.create({
      data: {
        clientId: data.clientId || null,
        staffId: data.staffId,
        locationId: data.locationId,
        appointmentId: data.appointmentId || null,
        subtotal,
        taxAmount,
        discountAmount,
        tipAmount,
        totalAmount,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        notes: data.notes || null,
        items: {
          create: data.items.map((item: any) => ({
            itemType: item.type,
            serviceId: item.type === "service" ? item.id : null,
            productId: item.type === "product" ? item.id : null,
            quantity: item.quantity,
            unitPrice: item.price,
            discountAmount: item.discountAmount || 0,
            taxAmount: item.taxAmount || 0,
            totalAmount: item.price * item.quantity + (item.taxAmount || 0) - (item.discountAmount || 0),
          }))
        }
      },
      include: {
        client: true,
        staff: true,
        location: true,
        items: {
          include: {
            product: true,
            service: true
          }
        }
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