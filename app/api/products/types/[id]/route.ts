import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// TODO: ProductType model needs to be added to Prisma schema
// This route is currently non-functional until the model is defined

// DELETE /api/products/types/[id] - Delete a product type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { error: 'ProductType model not implemented in Prisma schema' },
    { status: 501 }
  );
}

// GET /api/products/types/[id] - Get a specific type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { error: 'ProductType model not implemented in Prisma schema' },
    { status: 501 }
  );
}

// PUT /api/products/types/[id] - Update a type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { error: 'ProductType model not implemented in Prisma schema' },
    { status: 501 }
  );
}
