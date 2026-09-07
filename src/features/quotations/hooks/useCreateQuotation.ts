import { useMutation, useQueryClient } from '@tanstack/react-query'
import { quotationsApi, type CreateQuotationInput } from '../api/quotations.api'

export function useCreateQuotation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateQuotationInput) => quotationsApi.create(body).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotations'] }),
  })
}
