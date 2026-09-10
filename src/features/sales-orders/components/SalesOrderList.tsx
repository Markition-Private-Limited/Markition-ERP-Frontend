import axios from 'axios'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { FormField } from '../../../shared/components/FormField'
import { ReferenceSelect } from '../../../shared/components/ReferenceSelect'
import { Table, type TableColumn } from '../../../shared/components/Table'
import type { SalesOrder } from '../../../shared/types'
import type { InvoiceReadiness } from '../../company-profile/api/company-profile.api'
import { useInvoiceReadiness } from '../../company-profile/hooks/useInvoiceReadiness'
import type { ProductUnit } from '../../inventory/api/inventory.api'
import { useAddProductUnit, useProductUnits } from '../../inventory/hooks/useProductDetail'
import { useSalesOrders } from '../hooks/useSalesOrders'
import { useGenerateInvoice } from '../hooks/useGenerateInvoice'

function AddSerialNumberForm({ productId, onSuccess }: { productId: string; onSuccess: (unit: ProductUnit) => void }) {
  const [serialNumber, setSerialNumber] = useState('')
  const mutation = useAddProductUnit(productId)

  function submit(event: FormEvent) {
    event.preventDefault()
    const serial = serialNumber.trim()
    if (!serial) return
    mutation.mutate(serial, {
      onSuccess: (unit) => {
        setSerialNumber('')
        onSuccess(unit)
      },
    })
  }

  return (
    <form onSubmit={submit} className="erp-form inline-create-form">
      <FormField label="Serial Number">
        <input
          required
          autoFocus
          value={serialNumber}
          onChange={(event) => setSerialNumber(event.target.value)}
        />
      </FormField>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Adding...' : 'Add Serial Number'}
      </button>
      {mutation.isError && <p role="alert">{getApiErrorMessage(mutation.error)}</p>}
    </form>
  )
}

function SerialNumberSelect({
  productId,
  productName,
  quantity,
  selectedUnitIds,
  onChange,
}: {
  productId: string
  productName: string
  quantity: number
  selectedUnitIds: string[]
  onChange: (unitIds: string[], knownUnits?: ProductUnit[]) => void
}) {
  const units = useProductUnits(productId, true)
  const [createdUnits, setCreatedUnits] = useState<ProductUnit[]>([])
  const availableUnits = [...(units.data ?? []), ...createdUnits]
    .filter((unit, index, all) => unit.status === 'IN_STOCK' && all.findIndex((candidate) => candidate.id === unit.id) === index)

  function updateSlot(index: number, unitId: string) {
    const next = [...selectedUnitIds]
    next[index] = unitId
    onChange(next, availableUnits)
  }

  return (
    <div className="serial-selector">
      <strong>{productName}</strong>
      {units.isPending ? <p>Loading serial numbers...</p> : units.isError ? <p role="alert">{getApiErrorMessage(units.error)}</p> : (
        Array.from({ length: quantity }, (_, index) => {
          const selectedInOtherSlots = new Set(selectedUnitIds.filter((_, slot) => slot !== index))
          const selectedUnitId = selectedUnitIds[index] ?? ''

          return (
            <label key={index} className="serial-select-row">
              Serial #{index + 1}
              <ReferenceSelect
                required
                value={selectedUnitId}
                onChange={(unitId) => updateSlot(index, unitId)}
                createLabel="serial number"
                dialogTitle={`Add serial number for ${productName}`}
                renderCreateForm={(created) => (
                  <AddSerialNumberForm
                    productId={productId}
                    onSuccess={(unit) => {
                      setCreatedUnits((current) => [...current, unit])
                      created(unit.id)
                      const next = [...selectedUnitIds]
                      next[index] = unit.id
                      onChange(next, [...availableUnits, unit])
                    }}
                  />
                )}
              >
                <option value="">Select serial number</option>
                {availableUnits.map((unit) => (
                  <option key={unit.id} value={unit.id} disabled={selectedInOtherSlots.has(unit.id)}>
                    {unit.serial_number}
                  </option>
                ))}
              </ReferenceSelect>
            </label>
          )
        })
      )}
    </div>
  )
}

function GenerateInvoiceControl({ order, readiness }: { order: SalesOrder; readiness?: InvoiceReadiness }) {
  const navigate = useNavigate()
  const mutation = useGenerateInvoice()

  const serializedItems = order.items.filter((i) => i.product?.tracking_type === 'SERIALIZED')
  const [selectedUnitIdsByProduct, setSelectedUnitIdsByProduct] = useState<Record<string, string[]>>({})
  const [knownUnitsByProduct, setKnownUnitsByProduct] = useState<Record<string, ProductUnit[]>>({})
  const [showForm, setShowForm] = useState(false)
  const [selectionError, setSelectionError] = useState('')
  const canGenerate = readiness?.ready === true

  function handleGenerate() {
    setSelectionError('')
    if (!canGenerate) return
    if (serializedItems.length > 0 && !showForm) {
      setShowForm(true)
      return
    }
    const items = []
    for (const item of serializedItems) {
      const quantity = Number(item.quantity)
      const productName = item.product?.name ?? item.product_id
      if (!Number.isInteger(quantity) || quantity < 1) {
        setSelectionError(`${productName} needs a whole-number quantity before selecting serial numbers.`)
        return
      }
      const selectedUnitIds = selectedUnitIdsByProduct[item.product_id] ?? []
      const serialNumbers = selectedUnitIds
        .slice(0, quantity)
        .map((unitId) => knownUnitsByProduct[item.product_id]?.find((unit) => unit.id === unitId)?.serial_number)
        .filter((serialNumber): serialNumber is string => Boolean(serialNumber))
      if (serialNumbers.length !== quantity) {
        setSelectionError(`Select ${quantity} serial number${quantity === 1 ? '' : 's'} for ${productName}.`)
        return
      }
      items.push({ product_id: item.product_id, serial_numbers: serialNumbers })
    }
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
        {serializedItems.map((item) => {
          const quantity = Number(item.quantity)
          return (
            <SerialNumberSelect
              key={item.id}
              productId={item.product_id}
              productName={item.product?.name ?? item.product_id}
              quantity={Number.isInteger(quantity) && quantity > 0 ? quantity : 0}
              selectedUnitIds={selectedUnitIdsByProduct[item.product_id] ?? []}
              onChange={(unitIds, knownUnits) => {
                setSelectedUnitIdsByProduct((current) => ({ ...current, [item.product_id]: unitIds }))
                if (knownUnits) setKnownUnitsByProduct((current) => ({ ...current, [item.product_id]: knownUnits }))
              }}
            />
          )
        })}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={mutation.isPending || !canGenerate}>
            {mutation.isPending ? 'Generating...' : 'Confirm & Generate'}
          </button>
          <button type="button" onClick={() => { setShowForm(false); setSelectionError(''); mutation.reset() }}>Cancel</button>
        </div>
        {selectionError && <span className="form-field-error" role="alert">{selectionError}</span>}
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
    { id: 'invoiced', header: 'Invoiced', render: (row) => (row.invoiced ? <span className="status status-issued">Yes</span> : <span className="status status-draft">No</span>), sortValue: (row) => (row.invoiced ? 1 : 0) },
    { id: 'created', header: 'Created At', render: (row) => new Date(row.created_at).toLocaleString(), sortValue: (row) => new Date(row.created_at) },
    { id: 'actions', header: 'Actions', sortable: false, render: (row) => row.invoiced ? null : <GenerateInvoiceControl order={row} readiness={readiness.data} /> },
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
