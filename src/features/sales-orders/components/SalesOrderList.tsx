import axios from 'axios'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { Table, type TableColumn } from '../../../shared/components/Table'
import type { SalesOrder } from '../../../shared/types'
import type { InvoiceReadiness } from '../../company-profile/api/company-profile.api'
import { useInvoiceReadiness } from '../../company-profile/hooks/useInvoiceReadiness'
import { useSalesOrders } from '../hooks/useSalesOrders'
import { useGenerateInvoice } from '../hooks/useGenerateInvoice'

function GenerateInvoiceControl({ order, readiness }: { order: SalesOrder; readiness?: InvoiceReadiness }) {
  const navigate = useNavigate()
  const mutation = useGenerateInvoice()

  const serializedItems = order.items.filter((i) => i.product?.tracking_type === 'SERIALIZED')
  const [serialInputs, setSerialInputs] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)
  const canGenerate = readiness?.ready === true

  function handleGenerate() {
    if (!canGenerate) return
    if (serializedItems.length > 0 && !showForm) {
      setShowForm(true)
      return
    }
    const items = serializedItems.map((i) => ({
      product_id: i.product_id,
      serial_numbers: (serialInputs[i.product_id] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    }))
    mutation.mutate(
      { id: order.id, items: items.length ? items : undefined },
      { onSuccess: (invoice) => navigate(`/invoices/${invoice.id}`) },
    )
  }

  function handleSubmitSerials(e: FormEvent) {
    e.preventDefault()
    handleGenerate()
  }

  let error = ''
  if (mutation.isError) {
    if (axios.isAxiosError(mutation.error)) {
      const status = mutation.error.response?.status
      const message = mutation.error.response?.data?.message ?? ''
      if (status === 409) {
        error = `Insufficient stock for: ${message}`
      } else {
        error = message || getApiErrorMessage(mutation.error)
      }
    } else {
      error = getApiErrorMessage(mutation.error)
    }
  }

  if (showForm) {
    return (
      <form onSubmit={handleSubmitSerials} className="table-actions">
        {serializedItems.map((item) => (
          <label key={item.product_id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {item.product?.name ?? item.product_id} — serial numbers (qty: {item.quantity}, comma-separated)
            <input
              required
              placeholder="e.g. SN001, SN002"
              value={serialInputs[item.product_id] ?? ''}
              onChange={(e) => setSerialInputs((prev) => ({ ...prev, [item.product_id]: e.target.value }))}
            />
          </label>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={mutation.isPending || !canGenerate}>
            {mutation.isPending ? 'Generating...' : 'Confirm & Generate'}
          </button>
          <button type="button" onClick={() => { setShowForm(false); mutation.reset() }}>Cancel</button>
        </div>
        {error && <span className="form-field-error" role="alert">{error}</span>}
      </form>
    )
  }

  return (
    <div className="table-actions">
      <button type="button" disabled={mutation.isPending || !canGenerate} onClick={handleGenerate}>
        {mutation.isPending ? 'Generating...' : 'Generate Invoice'}
      </button>
      {error && <span className="form-field-error" role="alert">{error}</span>}
    </div>
  )
}

export function SalesOrderList() {
  const query = useSalesOrders()
  const readiness = useInvoiceReadiness()
  if (query.isPending) return <p>Loading...</p>
  if (query.isError) return <p role="alert">{getApiErrorMessage(query.error)}</p>
  if (!query.data.length) return <p>No sales orders yet. Convert an accepted quotation to create one.</p>

  const customerName = (o: SalesOrder) => o.customer?.company_name ?? o.customer_id

  const columns: TableColumn<SalesOrder>[] = [
    { id: 'number', header: 'Order Number', render: (row) => row.order_number, sortValue: (row) => row.order_number },
    { id: 'customer', header: 'Customer', render: customerName, sortValue: customerName },
    { id: 'total', header: 'Total', render: (row) => row.total_amount, sortValue: (row) => Number(row.total_amount) },
    { id: 'status', header: 'Status', render: (row) => <span className={`status status-${row.status.toLowerCase()}`}>{row.status}</span>, sortValue: (row) => row.status },
    { id: 'invoiced', header: 'Invoiced', render: (row) => (row.invoice_id ? <span className="status status-issued">Yes</span> : <span className="status status-draft">No</span>), sortValue: (row) => (row.invoice_id ? 1 : 0) },
    { id: 'created', header: 'Created At', render: (row) => new Date(row.created_at).toLocaleString(), sortValue: (row) => new Date(row.created_at) },
    { id: 'actions', header: 'Actions', sortable: false, render: (row) => row.invoice_id ? null : <GenerateInvoiceControl order={row} readiness={readiness.data} /> },
  ]

  const fieldLabels: Record<InvoiceReadiness['missing_fields'][number], string> = {
    name: 'company name',
    tax_number: 'tax registration number',
  }

  return <>
    {readiness.data && !readiness.data.ready && (
      <p role="alert" className="form-field-error">
        Invoices cannot be generated until your Company Profile includes: {readiness.data.missing_fields.map((field) => fieldLabels[field]).join(', ')}.{' '}
        <Link to="/settings/company-profile">Complete Company Profile</Link>
      </p>
    )}
    {readiness.isError && (
      <p role="alert" className="form-field-error">
        Invoice readiness could not be checked. <Link to="/settings/company-profile">Review Company Profile</Link>
      </p>
    )}
    <Table columns={columns} rows={query.data} getRowKey={(row) => row.id} caption="Sales Orders" />
  </>
}
