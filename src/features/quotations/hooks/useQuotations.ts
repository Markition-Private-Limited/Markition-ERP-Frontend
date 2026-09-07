import { useQuery } from '@tanstack/react-query'
import { quotationsApi } from '../api/quotations.api'

export function useQuotations() {
  return useQuery({ queryKey: ['quotations'], queryFn: () => quotationsApi.list().then((r) => r.data) })
}

export function useQuotation(id: string) {
  return useQuery({ queryKey: ['quotations', id], queryFn: () => quotationsApi.getById(id).then((r) => r.data), enabled: Boolean(id) })
}
