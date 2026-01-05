import type { SVGProps } from "react"
import type { ComponentType } from "react"
export type NavChild = {
  name: string
  href: string,
  children: NavChild[]
}

export type NavItem = {
  name: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  current?: boolean
  children?: NavChild[]
}

export type Category = {
  id: string
  name: string,
  description: string,
  parent_category: string | null,
  category_image: string | null,
  category_image_url?: string | null,
  optimizedImageUrl?: string,
  secureUrl?: string,
  publicId?: string,
  createdAt?: string,
  updatedAt?: string,
}

export type Product = {
  id: string
  name: string
  categoryId: string
  categoryName?: string
  sku: string
  description: string
  price: number
  cost: number
  stock: number
  minStock: number
  unit: string
  barcode: string
  product_image?: string | null
  product_image_url?: string | null
  product_image_secureUrl?: string
  product_image_optimizedUrl?: string
  product_image_publicId?: string
  product_gallery?: Array<{
    url?: string
    secureUrl?: string
    optimizedUrl?: string
    publicId?: string
  }>
  createdAt?: string
  updatedAt?: string
}

export type OrderItem = {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export type SalesOrder = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  orderDate: string
  deliveryDate: string | null
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  notes: string
  createdAt?: string
  updatedAt?: string
}

export type PurchaseOrder = {
  id: string
  orderNumber: string
  supplierName: string
  supplierEmail: string
  supplierPhone: string
  supplierAddress: string
  orderDate: string
  expectedDate: string | null
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'pending' | 'ordered' | 'received' | 'cancelled'
  notes: string
  createdAt?: string
  updatedAt?: string
}

export type Invoice = {
  id: string
  invoiceNumber: string
  salesOrderId: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  invoiceDate: string
  dueDate: string | null
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paidAmount: number
  status: 'paid' | 'unpaid' | 'partial' | 'overdue'
  paymentMethod: string
  notes: string
  createdAt?: string
  updatedAt?: string
}

export type Stock = {
  id: string
  productId: string
  productName?: string
  productSku?: string
  quantity: number
  location: string
  warehouseSection: string
  batchNumber: string
  expiryDate: string | null
  notes: string
  createdAt?: string
  updatedAt?: string
}

export type DashboardSummary = {
  totalProducts: number
  totalSalesOrders: number
  totalPurchaseOrders: number
  totalInvoices: number
  totalRevenue: number
  pendingRevenue: number
  lowStockCount: number
  pendingSalesOrdersCount: number
  pendingPurchaseOrdersCount: number
}

export type SalesReport = {
  totalOrders: number
  totalRevenue: number
  completedOrders: number
  cancelledOrders: number
  ordersByStatus: Record<string, number>
  topProducts: Array<{
    productId: string
    productName: string
    quantity: number
    revenue: number
  }>
  salesOrders: SalesOrder[]
}

export type PurchaseReport = {
  totalOrders: number
  totalExpense: number
  receivedOrders: number
  cancelledOrders: number
  ordersByStatus: Record<string, number>
  topSuppliers: Array<{
    supplierName: string
    orderCount: number
    totalExpense: number
  }>
  purchaseOrders: PurchaseOrder[]
}

export type InventoryReport = {
  totalProducts: number
  totalStockQuantity: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
  lowStockProducts: Array<{
    id: string
    name: string
    sku: string
    stock: number
    minStock: number
  }>
  outOfStockProducts: Array<{
    id: string
    name: string
    sku: string
  }>
  productsByCategory: Array<{
    categoryId: string
    productCount: number
    totalStock: number
    totalValue: number
  }>
}

export type InvoiceReport = {
  totalInvoices: number
  totalAmount: number
  paidAmount: number
  unpaidAmount: number
  overdueCount: number
  overdueAmount: number
  invoicesByStatus: Record<string, number>
  overdueInvoices: Array<{
    id: string
    invoiceNumber: string
    customerName: string
    total: number
    paidAmount: number
    dueDate: string
  }>
}