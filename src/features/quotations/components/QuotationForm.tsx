import axios from 'axios'
import { FormEvent, useState } from 'react'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { ReferenceSelect } from '../../../shared/components/ReferenceSelect'
import { CustomerForm } from '../../customers/components/CustomerForm'
import { ProductForm } from '../../inventory/components/ProductForm'
import { useCustomers } from '../../customers/hooks/useCustomers'
import { useProducts } from '../../inventory/hooks/useProducts'
import type { Quotation } from '../../../shared/types'
import { useCreateQuotation } from '../hooks/useCreateQuotation'

interface LineItem { product_id: string; quantity: string; unit_price: string }
const emptyItem = (): LineItem => ({ product_id: '', quantity: '1', unit_price: '0' })

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function assertUuid(value: string, label: string): void {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`${label} has an invalid ID (got ${JSON.stringify(value)}). Please re-select or re-create it.`)
  }
}

export function QuotationForm({ onSuccess }: { onSuccess: (quotation: Quotation) => void }) {
  const customers = useCustomers()
  const products = useProducts()
  const mutation = useCreateQuotation()
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<LineItem[]>([emptyItem()])
  const [guardError, setGuardError] = useState('')

  function update(index: number, field: keyof LineItem, value: string) {
    setItems((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    setGuardError('')
    try {
      assertUuid(customerId, 'Customer')
      items.forEach((item, i) => assertUuid(item.product_id, `Line item ${i + 1} product`))
    } catch (e) {
      setGuardError(e instanceof Error ? e.message : 'Invalid selection — please re-select.')
      return
    }
    mutation.mutate(
      {
        customer_id: customerId,
        items: items.map((item) => ({
          product_id: item.product_id,
          unit_price: Number(item.unit_price),
          quantity: Number(item.quantity),
        })),
      },
      { onSuccess },
    )
  }

  let error = mutation.isError ? getApiErrorMessage(mutation.error) : ''
  if (axios.isAxiosError(mutation.error) && mutation.error.response?.status === 409) {
    const id = String(mutation.error.response.data?.message ?? '').match(/[0-9a-f]{8}-[0-9a-f-]{27,}/i)?.[0]
    error = `Insufficient stock for: ${products.data?.find((p) => p.id === id)?.name ?? 'selected product'}`
  }

  if (customers.isPending || products.isPending) return <p>Loading...</p>
  if (customers.isError) return <p role="alert">{getApiErrorMessage(customers.error)}</p>
  if (products.isError) return <p role="alert">{getApiErrorMessage(products.error)}</p>

  return (
    <form onSubmit={submit} className="erp-form invoice-form">
      <label>
        Customer{' '}
        <ReferenceSelect required value={customerId} onChange={setCustomerId} createLabel="customer" dialogTitle="Create customer" renderCreateForm={(created) => <CustomerForm onSuccess={(customer) => created(customer.id)} />}>
          <option value="">Select customer</option>
          {customers.data.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
        </ReferenceSelect>
      </label>
      <strong>Line Items</strong>
      {items.map((item, index) => {
        return (
          <div key={index} className="invoice-line-item">
            <label>
              Product{' '}
              <ReferenceSelect
                required
                value={item.product_id}
                onChange={(next) => {
                  const selected = products.data.find((p) => p.id === next)
                  update(index, 'product_id', next)
                  if (selected) update(index, 'unit_price', selected.selling_price)
                }}
                createLabel="product"
                dialogTitle="Create product"
                renderCreateForm={(created) => <ProductForm onSuccess={(product) => { created(product.id); update(index, 'unit_price', product.selling_price) }} />}
              >
                <option value="">Select product</option>
                {products.data.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.tracking_type === 'SERIALIZED' ? ' (individual units)' : ''}
                  </option>
                ))}
              </ReferenceSelect>
            </label>
            <label>Quantity <input type="number" required min="0.000001" step="0.000001" value={item.quantity} onChange={(e) => update(index, 'quantity', e.target.value)} /></label>
            <label>Unit Price <input type="number" required min="0" step="0.01" value={item.unit_price} onChange={(e) => update(index, 'unit_price', e.target.value)} /></label>
            <button type="button" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, i) => i !== index))}>Remove</button>
          </div>
        )
      })}
      <button type="button" onClick={() => setItems((current) => [...current, emptyItem()])}>Add Line Item</button>
      <button type="submit" disabled={mutation.isPending || !customers.data.length || !products.data.length}>
        {mutation.isPending ? 'Creating...' : 'Create Quotation'}
      </button>
      {guardError && <p role="alert">{guardError}</p>}
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
