import { useMutation, useQueryClient } from '@tanstack/react-query'
import { salesOrdersApi } from '../api/sales-orders.api'
import type { SalesOrderStatus } from '../../../shared/types'

export function useUpdateSalesOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SalesOrderStatus }) =>
      salesOrdersApi.updateStatus(id, status).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales-orders'] }),
  })
}
