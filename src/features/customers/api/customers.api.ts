import { api } from '../../../shared/lib/axios'
import type { Customer } from '../../../shared/types'

export interface CreateCustomerInput {
  customer_code: string
  company_name: string
  vat_number?: string | null
  phone?: string
  email?: string
  credit_limit?: number
  custom_fields?: Record<string, unknown>
}
export type UpdateCustomerInput = Partial<CreateCustomerInput>

export const customersApi = {
  list: () => api.get<Customer[]>('/customers'),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (body: CreateCustomerInput) => api.post<Customer>('/customers', body),
  update: (id: string, body: UpdateCustomerInput) => api.patch<Customer>(`/customers/${id}`, body),
}

export const getCustomers = () => customersApi.list().then((response) => response.data)
export const createCustomer = (input: CreateCustomerInput) => customersApi.create(input).then((response) => response.data)
export const updateCustomer = (id: string, input: UpdateCustomerInput) => customersApi.update(id, input).then((response) => response.data)
