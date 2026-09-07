import { api } from '../../../shared/lib/axios'

export interface TaxConfiguration {
  tenant_id: string
  tax_name: string | null
  tax_rate: string | null
  updated_at: string | null
}

export interface UpsertTaxConfigurationInput {
  tax_name: string
  tax_rate: number
}

export const taxConfigurationApi = {
  get: () => api.get<TaxConfiguration>('/tax-configuration'),
  upsert: (body: UpsertTaxConfigurationInput) =>
    api.put<TaxConfiguration>('/tax-configuration', body),
}
