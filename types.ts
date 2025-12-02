export interface Product {
  id: number;
  barcode: string | null;
  name: string;
  category: string;
  description: string | null;
  price: number; // Decimal in Prisma, number in JS
  cost: number;
  stock: number;
  minStock: number;
  expiryDate: string | null; // ISO Date string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  expiredCount: number;
}

export type SortField = 'name' | 'stock' | 'price' | 'expiryDate';
export type SortOrder = 'asc' | 'desc';