import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCustomer, type CreateCustomerInput } from '../api/customers.api'
export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: (created) => {
      queryClient.setQueryData(['customers'], (current: typeof created[] | undefined) =>
        current ? [created, ...current.filter((customer) => customer.id !== created.id)] : [created],
      )
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
