import { useState } from 'react'
import { ProductForm } from '../components/ProductForm'
import { ProductList } from '../components/ProductList'
export function InventoryPage() {
  const [showForm, setShowForm] = useState(false)
  return <><h1>Inventory</h1><button onClick={() => setShowForm((value) => !value)}>{showForm ? 'Cancel' : 'Add Product'}</button>
    {showForm && <ProductForm onSuccess={() => setShowForm(false)} />}<ProductList /></>
}
