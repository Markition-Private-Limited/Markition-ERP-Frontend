import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { Table, type TableColumn } from '../../../shared/components/Table'
import { categoriesApi, type Category } from '../api/categories.api'
import { useCategories } from '../hooks/useCategories'

export function CategoryList() {
  const query = useCategories()
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })

  if (query.isPending) return <p>Loading...</p>
  if (query.isError) return <p role="alert">{getApiErrorMessage(query.error)}</p>
  if (!query.data.length) return <p>No categories yet.</p>

  const categoriesById = new Map(query.data.map((category) => [category.id, category]))

  function deleteCategory(id: string) {
    if (confirm('Delete this category?')) deleteMutation.mutate(id)
  }

  const parentName = (category: Category) => category.parent_category_id ? categoriesById.get(category.parent_category_id)?.name ?? '-' : '-'
  const columns: TableColumn<Category>[] = [
    { id: 'name', header: 'Name', render: (row) => row.name, sortValue: (row) => row.name },
    { id: 'parent', header: 'Parent Category', render: parentName, sortValue: parentName },
    { id: 'actions', header: 'Actions', sortable: false, render: (row) => <button className="button-danger" onClick={() => deleteCategory(row.id)} disabled={deleteMutation.isPending}>Delete</button> },
  ]

  return <>
    <Table columns={columns} rows={query.data} getRowKey={(row) => row.id} caption="Categories" />
    {deleteMutation.isError && <p role="alert">{getApiErrorMessage(deleteMutation.error)}</p>}
  </>
}
