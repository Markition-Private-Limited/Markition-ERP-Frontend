import { useQuery } from '@tanstack/react-query'
import { companyProfileApi } from '../api/company-profile.api'

export function useCompanyProfile() {
  return useQuery({
    queryKey: ['company-profile'],
    queryFn: () => companyProfileApi.get().then((r) => r.data),
  })
}
