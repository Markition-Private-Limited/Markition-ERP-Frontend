import { api } from '../../../shared/lib/axios'
import type { Product, TrackingType } from '../../../shared/types'

export interface CreateProductInput {
  sku: string
  name: string
  cost_price: number
  selling_price: number
  category_id?: string
  base_unit_id?: string
  sell_unit_id?: string
  tracking_type?: TrackingType
  stock_qty?: number
  custom_fields?: Record<string, unknown>
}
export interface UpdateProductInput {
  sku?: string
  name?: string
  cost_price?: number
  selling_price?: number
  category_id?: string
  base_unit_id?: string
  sell_unit_id?: string
  custom_fields?: Record<string, unknown>
}
export interface AdjustStockInput { quantity: number; reference_type?: string; reference_id?: string }
export interface ProductUnit {
  id: string
  product_id: string
  serial_number: string
  status: 'IN_STOCK' | 'SOLD'
  sold_in_invoice_id: string | null
  created_at: string
}
export interface InventoryProduct extends Product {
  category_id?: string | null
  base_unit_id?: string | null
  sell_unit_id?: string | null
  baseUnit?: { id: string; name: string; code: string } | null
  sellUnit?: { id: string; name: string; code: string } | null
}

export const inventoryApi = {
  listProducts: () => api.get<InventoryProduct[]>('/products'),
  getProductById: (id: string) => api.get<InventoryProduct>(`/products/${id}`),
  createProduct: (body: CreateProductInput) => api.post<InventoryProduct>('/products', body),
  updateProduct: (id: string, body: UpdateProductInput) => api.patch<InventoryProduct>(`/products/${id}`, body),
  adjustStock: (id: string, body: AdjustStockInput) => api.patch<InventoryProduct>(`/products/${id}/adjust-stock`, body),
  addProductUnit: (id: string, body: { serial_number: string }) => api.post<ProductUnit>(`/products/${id}/units`, body),
  listProductUnits: (id: string) => api.get<ProductUnit[]>(`/products/${id}/units`),
}

export const getProducts = () => inventoryApi.listProducts().then((response) => response.data)
export const createProduct = (input: CreateProductInput) => inventoryApi.createProduct(input).then((response) => response.data)
