import { useMutation, useQueryClient } from '@tanstack/react-query'
import { taxConfigurationApi, type UpsertTaxConfigurationInput } from '../api/tax-configuration.api'

export function useUpsertTaxConfiguration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpsertTaxConfigurationInput) =>
      taxConfigurationApi.upsert(body).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['tax-configuration'], data)
    },
  })
}
