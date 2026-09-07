import { useMutation, useQueryClient } from '@tanstack/react-query'
import { companyProfileApi, type UpdateCompanyProfileInput } from '../api/company-profile.api'

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateCompanyProfileInput) =>
      companyProfileApi.update(body).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['company-profile'], data)
      void queryClient.invalidateQueries({ queryKey: ['company-profile', 'invoice-readiness'] })
    },
  })
}
