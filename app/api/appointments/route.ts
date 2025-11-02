import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromHeaders } from "@/lib/auth-server";

/**
 * GET /api/appointments
 * 
 * Get all appointments with location-based access control
 */
export async function GET(request: NextRequest) {
  try {
    // Get user information from headers (set by middleware)
    const currentUser = getUserFromHeaders(request);
    
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    const staffId = searchParams.get("staffId");
    const clientId = searchParams.get("clientId");
    const date = searchParams.get("date");

    // Build where clause for Prisma query
    const whereClause: any = {
      isActive: true
    };

    // Apply filters
    if (locationId) {
      whereClause.locationId = locationId;
    }

    if (staffId) {
      whereClause.staffId = staffId;
    }

    if (clientId) {
      whereClause.clientId = clientId;
    }

    // Get appointments from database
    let appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log("API: Retrieved appointments from database", appointments.length);

    // Apply location-based access control
    if (currentUser && currentUser.locations.length > 0 && !currentUser.locations.includes("all")) {
      appointments = appointments.filter(
        appointment => currentUser.locations.includes(appointment.locationId)
      );
      console.log(`🔒 Filtered appointments by user location access: ${appointments.length} appointments visible to user`);
    }

    // Transform appointments to match expected format
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      clientId: appointment.clientId,
      clientName: appointment.client?.name || "Unknown Client",
      staffId: appointment.staffId,
      staffName: appointment.staff?.name || "Unknown Staff",
      service: appointment.service?.name || "Unknown Service",
      serviceId: appointment.serviceId,
      date: appointment.date.toISOString(),
      duration: appointment.service?.duration || 0,
      location: appointment.locationId,
      locationName: appointment.location?.name || "Unknown Location",
      price: Number(appointment.service?.price) || 0,
      notes: appointment.notes || "",
      status: appointment.status,
      statusHistory: appointment.statusHistory ? JSON.parse(appointment.statusHistory as string) : [],
      type: appointment.type || "service",
      paymentStatus: appointment.paymentStatus || "unpaid",
      paymentMethod: appointment.paymentMethod || "",
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString()
    }));

    console.log(`API: Final filtered appointments: ${transformedAppointments.length}`);
    
    return NextResponse.json({ 
      appointments: transformedAppointments,
      total: transformedAppointments.length
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}