import { FormEvent, useState } from 'react'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { FormField } from '../../../shared/components/FormField'
import { ReferenceSelect } from '../../../shared/components/ReferenceSelect'
import type { Category } from '../api/categories.api'
import { useCategories } from '../hooks/useCategories'
import { useCreateCategory } from '../hooks/useCreateCategory'

export function CategoryForm({ onSuccess }: { onSuccess?: (category: Category) => void }) {
  const [name, setName] = useState('')
  const [parentCategoryId, setParentCategoryId] = useState('')
  const categories = useCategories()
  const mutation = useCreateCategory()

  function submit(event: FormEvent) {
    event.preventDefault()
    event.stopPropagation()
    mutation.mutate({ name, ...(parentCategoryId && { parent_category_id: parentCategoryId }) }, {
      onSuccess: (category) => {
        setName('')
        setParentCategoryId('')
        onSuccess?.(category)
      },
    })
  }

  return <form onSubmit={submit} className="erp-form form-narrow">
    <FormField label="Name"><input required value={name} onChange={(event) => setName(event.target.value)} /></FormField>
    <FormField label="Parent Category"><ReferenceSelect value={parentCategoryId} onChange={setParentCategoryId} createLabel="category" dialogTitle="Create category" renderCreateForm={(created) => <CategoryForm onSuccess={(category) => created(category.id)} />}>
      <option value="">No parent category</option>
      {categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
    </ReferenceSelect></FormField>
    <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Category'}</button>
    {(categories.isError || mutation.isError) && <p role="alert">{getApiErrorMessage(categories.error ?? mutation.error)}</p>}
  </form>
}
