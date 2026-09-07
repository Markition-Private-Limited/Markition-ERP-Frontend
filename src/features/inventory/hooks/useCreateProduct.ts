import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProduct } from '../api/inventory.api'
export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (created) => {
      queryClient.setQueryData(['products'], (current: typeof created[] | undefined) =>
        current ? [created, ...current.filter((product) => product.id !== created.id)] : [created],
      )
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
