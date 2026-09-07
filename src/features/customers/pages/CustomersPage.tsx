import { useState } from 'react'
import { CustomerForm } from '../components/CustomerForm'
import { CustomerList } from '../components/CustomerList'
import type { Customer } from '../../../shared/types'
export function CustomersPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer>()
  const closeForm = () => { setShowForm(false); setEditingCustomer(undefined) }
  return <><h1>Customers</h1><button onClick={() => { if (showForm) closeForm(); else setShowForm(true) }}>{showForm ? 'Cancel' : 'Add Customer'}</button>
    {showForm && <CustomerForm key={editingCustomer?.id ?? 'new'} customer={editingCustomer} onSuccess={closeForm} />}
    <CustomerList onEdit={(customer) => { setEditingCustomer(customer); setShowForm(true) }} /></>
}
