import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCustomer, type UpdateCustomerInput } from '../api/customers.api'

export function useUpdateCustomer(customerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCustomerInput) => updateCustomer(customerId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(['customers'], (current: typeof updated[] | undefined) =>
        current?.map((customer) => customer.id === updated.id ? updated : customer),
      )
      queryClient.setQueryData(['customers', updated.id], updated)
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
