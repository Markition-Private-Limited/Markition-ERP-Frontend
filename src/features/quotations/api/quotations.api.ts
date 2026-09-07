import { api } from '../../../shared/lib/axios'
import type { Quotation, QuotationStatus } from '../../../shared/types'

export interface CreateQuotationItemInput {
  product_id: string
  unit_price: number
  quantity: number
}
export interface CreateQuotationInput { customer_id: string; items: CreateQuotationItemInput[] }

export const quotationsApi = {
  list: () => api.get<Quotation[]>('/quotations'),
  getById: (id: string) => api.get<Quotation>(`/quotations/${id}`),
  create: (body: CreateQuotationInput) => api.post<Quotation>('/quotations', body),
  updateStatus: (id: string, status: QuotationStatus) => api.patch<Quotation>(`/quotations/${id}/status`, { status }),
  convertToSalesOrder: (id: string) => api.post(`/quotations/${id}/convert-to-sales-order`),
}
