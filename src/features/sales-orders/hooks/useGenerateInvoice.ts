import { useMutation, useQueryClient } from '@tanstack/react-query'
import { salesOrdersApi, type GenerateInvoiceInput } from '../api/sales-orders.api'

export function useGenerateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: GenerateInvoiceInput) => salesOrdersApi.generateInvoice(input).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] })
    },
  })
}
