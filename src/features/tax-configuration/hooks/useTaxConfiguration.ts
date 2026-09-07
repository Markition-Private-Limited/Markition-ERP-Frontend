import { useQuery } from '@tanstack/react-query'
import { taxConfigurationApi } from '../api/tax-configuration.api'

export function useTaxConfiguration() {
  return useQuery({
    queryKey: ['tax-configuration'],
    queryFn: () => taxConfigurationApi.get().then((r) => r.data),
  })
}
