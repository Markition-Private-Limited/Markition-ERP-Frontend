import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventory.api'

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => inventoryApi.getProductById(id).then((response) => response.data),
    enabled: Boolean(id),
  })
}

export function useProductUnits(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ['products', id, 'units'],
    queryFn: () => inventoryApi.listProductUnits(id).then((response) => response.data),
    enabled: Boolean(id) && enabled,
  })
}

export function useAdjustStock(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (quantity: number) => inventoryApi.adjustStock(id, { quantity }).then((response) => response.data),
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(['products', id], (current: typeof updatedProduct | undefined) => ({ ...current, ...updatedProduct }))
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useAddProductUnit(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (serial_number: string) => inventoryApi.addProductUnit(id, { serial_number }).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', id, 'units'] }),
  })
}
