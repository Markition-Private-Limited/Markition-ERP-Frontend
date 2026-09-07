import { getApiErrorMessage } from '../../../shared/lib/axios'
import { Table, type TableColumn } from '../../../shared/components/Table'
import type { Customer } from '../../../shared/types'
import { useCustomers } from '../hooks/useCustomers'
export function CustomerList({ onEdit }: { onEdit: (customer: Customer) => void }) {
  const query = useCustomers()
  if (query.isPending) return <p>Loading...</p>
  if (query.isError) return <p role="alert">{getApiErrorMessage(query.error)}</p>
  if (!query.data.length) return <p>No customers yet.</p>
  const columns: TableColumn<Customer>[] = [
    { id: 'company', header: 'Company Name', render: (row) => row.company_name, sortValue: (row) => row.company_name },
    { id: 'phone', header: 'Phone', render: (row) => row.phone ?? '—', sortValue: (row) => row.phone },
    { id: 'email', header: 'Email', render: (row) => row.email ?? '—', sortValue: (row) => row.email },
    { id: 'credit', header: 'Credit Limit', render: (row) => row.credit_limit, sortValue: (row) => Number(row.credit_limit) },
    { id: 'balance', header: 'Outstanding Balance', render: (row) => row.outstanding_balance, sortValue: (row) => Number(row.outstanding_balance) },
    { id: 'actions', header: 'Actions', render: (row) => <button type="button" className="button-secondary" onClick={() => onEdit(row)}>Edit</button> },
  ]
  return <Table columns={columns} rows={query.data} getRowKey={(row) => row.id} caption="Customers" />
}
