import { FormEvent, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FormField } from '../../../shared/components/FormField'
import { Table, type TableColumn } from '../../../shared/components/Table'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import type { ProductUnit } from '../api/inventory.api'
import { useAddProductUnit, useAdjustStock, useProduct, useProductUnits } from '../hooks/useProductDetail'

const unitColumns: TableColumn<ProductUnit>[] = [
  { id: 'serial', header: 'Serial Number', render: (unit) => unit.serial_number, sortValue: (unit) => unit.serial_number },
  { id: 'status', header: 'Status', render: (unit) => unit.status === 'IN_STOCK' ? 'In Stock' : 'Sold', sortValue: (unit) => unit.status },
]

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const product = useProduct(id)
  const serialized = product.data?.tracking_type === 'SERIALIZED'
  const units = useProductUnits(id, serialized)
  const adjustStock = useAdjustStock(id)
  const addUnit = useAddProductUnit(id)
  const [adjustment, setAdjustment] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

  if (product.isPending) return <p>Loading...</p>
  if (product.isError) return <p role="alert">{getApiErrorMessage(product.error)}</p>

  function submitAdjustment(event: FormEvent) {
    event.preventDefault()
    const quantity = Number(adjustment)
    if (!Number.isFinite(quantity) || quantity === 0) return
    adjustStock.mutate(quantity, { onSuccess: () => setAdjustment('') })
  }

  function submitSerial(event: FormEvent) {
    event.preventDefault()
    const serial = serialNumber.trim()
    if (!serial) return
    addUnit.mutate(serial, { onSuccess: () => setSerialNumber('') })
  }

  return <>
    <h1>{product.data.name}</h1>
    <p>SKU: {product.data.sku}</p>
    <p>Type: {serialized ? 'Serialized' : 'Bulk'}</p>

    {!serialized ? <section className="detail-section">
      <h2>Stock</h2>
      <p className="stock-quantity">{product.data.stock_qty}{product.data.baseUnit?.name ? ` ${product.data.baseUnit.name}` : ''}</p>
      <form onSubmit={submitAdjustment} className="inline-form">
        <FormField label="Adjustment quantity (+/-)">
          <input required type="number" step="0.000001" value={adjustment} onChange={(event) => setAdjustment(event.target.value)} />
        </FormField>
        <button type="submit" disabled={adjustStock.isPending || Number(adjustment) === 0}>
          {adjustStock.isPending ? 'Adjusting...' : 'Adjust Stock'}
        </button>
      </form>
      {adjustStock.isSuccess && <p role="status">Stock updated successfully.</p>}
      {adjustStock.isError && <p role="alert">{getApiErrorMessage(adjustStock.error)}</p>}
    </section> : <section className="detail-section">
      <h2>Serial Numbers</h2>
      {units.isPending ? <p>Loading serial numbers...</p> : units.isError ? <p role="alert">{getApiErrorMessage(units.error)}</p> : units.data.length > 0
        ? <Table columns={unitColumns} rows={units.data} getRowKey={(unit) => unit.id} caption="Product serial numbers" />
        : <div className="empty-state">No serial numbers added yet. Add one below to make this product available for invoicing.</div>}
      <form onSubmit={submitSerial} className="inline-form">
        <FormField label="Serial Number">
          <input required value={serialNumber} onChange={(event) => setSerialNumber(event.target.value)} />
        </FormField>
        <button type="submit" disabled={addUnit.isPending}>{addUnit.isPending ? 'Adding...' : 'Add Serial Number'}</button>
      </form>
      {addUnit.isError && <p role="alert">{getApiErrorMessage(addUnit.error)}</p>}
    </section>}
  </>
}
