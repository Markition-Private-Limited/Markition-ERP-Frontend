import { useMutation, useQueryClient } from '@tanstack/react-query'
import { companyProfileApi } from '../api/company-profile.api'

export function useUploadLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) =>
      companyProfileApi.uploadLogo(file).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['company-profile'], data)
    },
  })
}
