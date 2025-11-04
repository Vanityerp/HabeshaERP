import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { seedComprehensiveBeautyProducts } from "@/scripts/seed-comprehensive-beauty-products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    console.log('🌱 Starting comprehensive beauty product seeding...')
    
    const result = await seedComprehensiveBeautyProducts()
    
    console.log('✅ Comprehensive product seeding completed successfully')
    return NextResponse.json({ 
      message: "Comprehensive beauty products seeded successfully",
      ...result
    })
  } catch (error) {
    console.error('❌ Error seeding comprehensive products:', error)
    return NextResponse.json({ 
      error: "Failed to seed comprehensive products",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
