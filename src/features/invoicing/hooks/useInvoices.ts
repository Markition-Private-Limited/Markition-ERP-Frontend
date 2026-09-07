import { useQuery } from '@tanstack/react-query'
import { invoicingApi } from '../api/invoicing.api'
export function useInvoices() { return useQuery({ queryKey: ['invoices'], queryFn: () => invoicingApi.list().then((response) => response.data) }) }
export function useInvoice(id: string) { return useQuery({ queryKey: ['invoices', id], queryFn: () => invoicingApi.getById(id).then((response) => response.data), enabled: Boolean(id) }) }
