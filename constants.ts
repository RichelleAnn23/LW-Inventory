import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    barcode: "4800016055321",
    name: "San Mig Light 330ml",
    category: "Alcoholic",
    description: "Low calorie beer, light and refreshing taste.",
    price: 45.00,
    cost: 32.50,
    stock: 120,
    minStock: 24,
    expiryDate: "2024-12-31",
    isActive: true,
    createdAt: "2023-10-01T10:00:00Z",
    updatedAt: "2023-10-15T14:30:00Z"
  },
  {
    id: 2,
    barcode: "4807770270017",
    name: "Piattos Cheese - Large",
    category: "Snacks",
    description: "Crispy hexagonal potato chips with cheese flavor.",
    price: 38.00,
    cost: 28.00,
    stock: 15, // Low stock
    minStock: 20,
    expiryDate: "2024-06-15",
    isActive: true,
    createdAt: "2023-09-20T09:00:00Z",
    updatedAt: "2023-10-10T11:00:00Z"
  },
  {
    id: 3,
    barcode: null,
    name: "Jasmine Rice 1kg",
    category: "Rice",
    description: "Premium grade fragrant jasmine rice.",
    price: 55.00,
    cost: 42.00,
    stock: 50,
    minStock: 10,
    expiryDate: null,
    isActive: true,
    createdAt: "2023-10-05T08:00:00Z",
    updatedAt: "2023-10-05T08:00:00Z"
  },
  {
    id: 4,
    barcode: "4806502341219",
    name: "Coke Zero 1.5L",
    category: "Non-Alcoholic",
    description: "Zero sugar cola beverage.",
    price: 75.00,
    cost: 58.00,
    stock: 8, // Very low
    minStock: 12,
    expiryDate: "2024-01-20",
    isActive: true,
    createdAt: "2023-10-02T16:00:00Z",
    updatedAt: "2023-10-18T09:15:00Z"
  },
  {
    id: 5,
    barcode: "4800045612345",
    name: "Gardenia White Bread",
    category: "Bakery",
    description: "Freshly baked white bread loaf.",
    price: 82.00,
    cost: 65.00,
    stock: 5,
    minStock: 10,
    expiryDate: "2023-10-25", // Expired/Expiring depending on 'now'
    isActive: true,
    createdAt: "2023-10-20T05:00:00Z",
    updatedAt: "2023-10-20T05:00:00Z"
  },
  {
    id: 6,
    barcode: "4801234567890",
    name: "Cornetto Vanilla",
    category: "Frozen",
    description: "Vanilla ice cream cone with chocolate tip.",
    price: 30.00,
    cost: 20.00,
    stock: 45,
    minStock: 10,
    expiryDate: "2024-08-30",
    isActive: true,
    createdAt: "2023-09-15T13:00:00Z",
    updatedAt: "2023-10-12T10:20:00Z"
  },
  {
    id: 7,
    barcode: "4809876543210",
    name: "Safeguard White Soap",
    category: "Personal Care",
    description: "Antibacterial bar soap.",
    price: 45.00,
    cost: 35.00,
    stock: 100,
    minStock: 20,
    expiryDate: "2026-01-01",
    isActive: true,
    createdAt: "2023-08-01T10:00:00Z",
    updatedAt: "2023-08-01T10:00:00Z"
  },
];

export const CATEGORIES = [
  "All",
  "Alcoholic",
  "Non-Alcoholic",
  "Snacks",
  "Rice",
  "Bakery",
  "Frozen",
  "Personal Care",
  "Canned Goods"
];
