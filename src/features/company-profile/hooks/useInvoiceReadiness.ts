import { useQuery } from '@tanstack/react-query'
import { companyProfileApi } from '../api/company-profile.api'

export function useInvoiceReadiness() {
  return useQuery({
    queryKey: ['company-profile', 'invoice-readiness'],
    queryFn: () => companyProfileApi.getInvoiceReadiness().then((response) => response.data),
  })
}
