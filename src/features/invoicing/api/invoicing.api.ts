import { api } from '../../../shared/lib/axios'
import type { Invoice } from '../../../shared/types'

export const invoicingApi = {
  list: () => api.get<Invoice[]>('/invoices'),
  getById: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  getPdf: (id: string) => api.get<Blob>(`/invoices/${id}/pdf`, { responseType: 'blob' }),
}

export const getInvoices = () => invoicingApi.list().then((response) => response.data)
export const getInvoice = (id: string) => invoicingApi.getById(id).then((response) => response.data)
