import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { Table, type TableColumn } from '../../../shared/components/Table'
import type { InventoryProduct } from '../api/inventory.api'
import { useAdjustStock } from '../hooks/useProductDetail'
import { useProducts } from '../hooks/useProducts'

function AddStockControl({ productId }: { productId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [quantity, setQuantity] = useState('')
  const mutation = useAdjustStock(productId)

  function submit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate(Number(quantity), {
      onSuccess: () => {
        setQuantity('')
        setShowForm(false)
      },
    })
  }

  return <>
    <button type="button" onClick={() => setShowForm((value) => !value)}>{showForm ? 'Cancel' : 'Add Stock'}</button>
    {showForm && <form onSubmit={submit} className="inline-form">
      <label>Quantity <input required type="number" min="0.000001" step="0.000001" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
      <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Adding...' : 'Add'}</button>
    </form>}
    {mutation.isError && <p role="alert">{getApiErrorMessage(mutation.error)}</p>}
  </>
}

export function ProductList() {
  const query = useProducts()
  if (query.isPending) return <p>Loading...</p>
  if (query.isError) return <p role="alert">{getApiErrorMessage(query.error)}</p>
  if (!query.data.length) return <p>No products yet.</p>
  const columns: TableColumn<InventoryProduct>[] = [
    { id: 'sku', header: 'SKU', render: (row) => row.sku, sortValue: (row) => row.sku },
    { id: 'name', header: 'Name', render: (row) => row.name, sortValue: (row) => row.name },
    { id: 'price', header: 'Selling Price', render: (row) => row.selling_price, sortValue: (row) => Number(row.selling_price) },
    { id: 'stock', header: 'Stock Qty', render: (row) => row.stock_qty, sortValue: (row) => Number(row.stock_qty) },
    { id: 'tracking', header: 'Tracking Type', render: (row) => row.tracking_type, sortValue: (row) => row.tracking_type },
    { id: 'actions', header: 'Actions', sortable: false, render: (row) => <div className="table-actions"><Link to={`/inventory/${row.id}`}>View</Link>{row.tracking_type === 'BULK' && <AddStockControl productId={row.id} />}</div> },
  ]
  return <Table columns={columns} rows={query.data} getRowKey={(row) => row.id} caption="Inventory products" />
}
