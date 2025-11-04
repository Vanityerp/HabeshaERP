export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  imageUrl?: string;
  category?: string;
  supplier?: string;
  minStockLevel?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  locations?: Array<{
    locationId: string;
    stock: number;
  }>;
}