import { useState } from 'react'
import { CategoryForm } from '../components/CategoryForm'
import { CategoryList } from '../components/CategoryList'

export function CategoriesPage() {
  const [showForm, setShowForm] = useState(false)
  return <><h1>Categories</h1><button onClick={() => setShowForm((value) => !value)}>{showForm ? 'Cancel' : 'Add Category'}</button>
    {showForm && <CategoryForm onSuccess={() => setShowForm(false)} />}<CategoryList /></>
}
