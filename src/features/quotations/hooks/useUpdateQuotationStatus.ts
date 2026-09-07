import { useMutation, useQueryClient } from '@tanstack/react-query'
import { quotationsApi } from '../api/quotations.api'
import type { QuotationStatus } from '../../../shared/types'

export function useUpdateQuotationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuotationStatus }) =>
      quotationsApi.updateStatus(id, status).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotations'] }),
  })
}
