import { useQuery } from '@tanstack/react-query'
import { salesOrdersApi } from '../api/sales-orders.api'

export function useSalesOrders() {
  return useQuery({ queryKey: ['sales-orders'], queryFn: () => salesOrdersApi.list().then((r) => r.data) })
}

export function useSalesOrder(id: string) {
  return useQuery({ queryKey: ['sales-orders', id], queryFn: () => salesOrdersApi.getById(id).then((r) => r.data), enabled: Boolean(id) })
}
