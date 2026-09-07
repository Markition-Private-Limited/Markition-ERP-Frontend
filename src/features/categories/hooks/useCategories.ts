import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '../api/categories.api'

export const useCategories = () => useQuery({
  queryKey: ['categories'],
  queryFn: () => categoriesApi.list().then((response) => response.data),
})
