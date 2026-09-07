import { useQuery } from '@tanstack/react-query'
import { customersApi } from '../api/customers.api'
export function useCustomers() { return useQuery({ queryKey: ['customers'], queryFn: () => customersApi.list().then((response) => response.data) }) }
