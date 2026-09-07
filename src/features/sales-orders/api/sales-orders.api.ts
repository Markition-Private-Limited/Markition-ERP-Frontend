import { api } from '../../../shared/lib/axios'
import type { Invoice, SalesOrder, SalesOrderStatus } from '../../../shared/types'

export interface GenerateInvoiceItemInput { product_id: string; serial_numbers: string[] }
export interface GenerateInvoiceInput { id: string; items?: GenerateInvoiceItemInput[] }

export const salesOrdersApi = {
  list: () => api.get<SalesOrder[]>('/sales-orders'),
  getById: (id: string) => api.get<SalesOrder>(`/sales-orders/${id}`),
  updateStatus: (id: string, status: SalesOrderStatus) => api.patch<SalesOrder>(`/sales-orders/${id}/status`, { status }),
  generateInvoice: ({ id, items }: GenerateInvoiceInput) =>
    api.post<Invoice>(`/sales-orders/${id}/generate-invoice`, items?.length ? { items } : undefined),
}
