export interface Permission { resource: string; action: string }
export interface Role { name: string; permissions: Permission[] }
export interface Tenant { id: string; name: string }
export interface User { id: string; email: string; tenant: Tenant; roles: Role[] }
export interface Customer {
  id: string; customer_code: string; company_name: string; phone: string | null; email: string | null
  vat_number: string | null; credit_limit: string; outstanding_balance: string
  custom_fields: Record<string, unknown>; created_at: string
}
export type TrackingType = 'BULK' | 'SERIALIZED'
export interface Product {
  id: string; sku: string; name: string; cost_price: string; selling_price: string
  stock_qty: string; tracking_type: TrackingType; created_at: string
}
export interface InvoiceItem {
  id: string; product_id: string; quantity: string; unit_price: string; line_total: string; product?: Product
}
export interface SoldProductUnit {
  id: string; product_id: string; serial_number: string; status: 'IN_STOCK' | 'SOLD'
}
export interface Invoice {
  id: string; invoice_number: string; customer_id: string; customer?: Customer; subtotal: string
  tax_amount: string; total_amount: string; status: 'DRAFT' | 'ISSUED'; created_at: string; items: InvoiceItem[]; soldUnits?: SoldProductUnit[]
}

export interface QuotationItem {
  id: string; product_id: string; quantity: string; unit_price: string; line_total: string; product?: Product
}
export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED'
export interface Quotation {
  id: string; quotation_number: string; customer_id: string; customer?: Customer
  subtotal: string; tax_amount: string; total_amount: string
  status: QuotationStatus; converted_to_sales_order_id: string | null; created_at: string; items: QuotationItem[]
}

export interface SalesOrderItem {
  id: string; product_id: string; quantity: string; unit_price: string; line_total: string; product?: Product
}
export type SalesOrderStatus = 'CONFIRMED' | 'FULFILLED' | 'CANCELLED'
export interface SalesOrder {
  id: string; order_number: string; customer_id: string; customer?: Customer
  subtotal: string; tax_amount: string; total_amount: string
  status: SalesOrderStatus; invoiced: boolean; invoice?: Invoice; created_at: string; items: SalesOrderItem[]
}
