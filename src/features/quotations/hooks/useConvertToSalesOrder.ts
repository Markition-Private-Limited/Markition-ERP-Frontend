import { useMutation, useQueryClient } from '@tanstack/react-query'
import { quotationsApi } from '../api/quotations.api'

export function useConvertToSalesOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => quotationsApi.convertToSalesOrder(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] })
    },
  })
}
