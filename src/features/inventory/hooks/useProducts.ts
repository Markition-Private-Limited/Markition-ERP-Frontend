import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventory.api'
export function useProducts() { return useQuery({ queryKey: ['products'], queryFn: () => inventoryApi.listProducts().then((response) => response.data) }) }
