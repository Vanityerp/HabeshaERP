import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { seedComprehensiveCategories } from "@/scripts/seed-comprehensive-categories";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    console.log('🌱 Starting comprehensive category seeding...')
    
    const result = await seedComprehensiveCategories()
    
    console.log('✅ Category seeding completed successfully')
    return NextResponse.json({ 
      message: "Categories seeded successfully",
      success: true,
      ...result
    })
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    return NextResponse.json({ 
      error: "Failed to seed categories",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
