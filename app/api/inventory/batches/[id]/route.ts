import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    const data = await request.json()
    console.log(`🔄 Updating product batch: ${params.id}`)

    // Check if batch exists
    const existingBatch = await prisma.productBatch.findUnique({
      where: { id: params.id }
    })

    if (!existingBatch) {
      return NextResponse.json({ error: "Product batch not found" }, { status: 404 })
    }

    // Update the batch
    const batch = await prisma.productBatch.update({
      where: { id: params.id },
      data: {
        batchNumber: data.batchNumber || existingBatch.batchNumber,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : existingBatch.expiryDate,
        quantity: data.quantity !== undefined ? parseInt(data.quantity) : existingBatch.quantity,
        costPrice: data.costPrice !== undefined ? parseFloat(data.costPrice) : existingBatch.costPrice,
        supplierInfo: data.supplierInfo !== undefined ? data.supplierInfo : existingBatch.supplierInfo,
        notes: data.notes !== undefined ? data.notes : existingBatch.notes,
        isActive: data.isActive !== undefined ? data.isActive : existingBatch.isActive,
        updatedAt: new Date()
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            sku: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log(`✅ Updated product batch: ${batch.batchNumber}`)
    return NextResponse.json({ 
      success: true, 
      message: "Product batch updated successfully",
      batch 
    })

  } catch (error) {
    console.error("❌ Error updating product batch:", error)
    return NextResponse.json({ 
      error: "Failed to update product batch",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// DELETE /api/inventory/batches/[id] - Delete/deactivate a product batch
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check user session and permissions
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log(`🔄 Deleting product batch: ${params.id}`)

    // Check if batch exists
    const existingBatch = await prisma.productBatch.findUnique({
      where: { id: params.id }
    })

    if (!existingBatch) {
      return NextResponse.json({ error: "Product batch not found" }, { status: 404 })
    }

    // Soft delete by marking as inactive
    const batch = await prisma.productBatch.update({
      where: { id: params.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    console.log(`✅ Deleted product batch: ${existingBatch.batchNumber}`)
    return NextResponse.json({ 
      success: true, 
      message: "Product batch deleted successfully"
    })

  } catch (error) {
    console.error("❌ Error deleting product batch:", error)
    return NextResponse.json({ 
      error: "Failed to delete product batch",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
