import { FormEvent, useState } from 'react'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { FormField } from '../../../shared/components/FormField'
import type { Customer } from '../../../shared/types'
import { useCreateCustomer } from '../hooks/useCreateCustomer'
import { useUpdateCustomer } from '../hooks/useUpdateCustomer'

interface CustomerFormProps {
  customer?: Customer
  onSuccess: (customer: Customer) => void
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const [companyName, setCompanyName] = useState(customer?.company_name ?? ''); const [customerCode, setCustomerCode] = useState(customer?.customer_code ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? ''); const [email, setEmail] = useState(customer?.email ?? ''); const [creditLimit, setCreditLimit] = useState(customer?.credit_limit ?? '0')
  const [vatNumber, setVatNumber] = useState(customer?.vat_number ?? '')
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer(customer?.id ?? '')
  const mutation = customer ? updateMutation : createMutation
  function submit(event: FormEvent) {
    event.preventDefault()
    event.stopPropagation()
    mutation.mutate({
      company_name: companyName,
      customer_code: customerCode,
      vat_number: vatNumber.trim() || null,
      ...(phone && { phone }),
      ...(email && { email }),
      credit_limit: Number(creditLimit),
    }, { onSuccess })
  }
  return <form onSubmit={submit} className="erp-form form-narrow">
    <FormField label="Company Name"><input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></FormField>
    <FormField label="Customer Code"><input required value={customerCode} onChange={(e) => setCustomerCode(e.target.value)} /></FormField>
    <FormField label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} /></FormField>
    <FormField label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></FormField>
    <FormField label="VAT Number"><input value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} /></FormField>
    <FormField label="Credit Limit"><input type="number" min="0" step="0.01" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} /></FormField>
    <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : customer ? 'Update Customer' : 'Save Customer'}</button>
    {mutation.isError && <p role="alert">{getApiErrorMessage(mutation.error)}</p>}
  </form>
}
