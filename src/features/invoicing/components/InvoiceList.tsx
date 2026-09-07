import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { Table, type TableColumn } from '../../../shared/components/Table'
import type { Invoice } from '../../../shared/types'
import { useInvoices } from '../hooks/useInvoices'
export function InvoiceList() {
  const query = useInvoices()
  if (query.isPending) return <p>Loading...</p>
  if (query.isError) return <p role="alert">{getApiErrorMessage(query.error)}</p>
  if (!query.data.length) return <p>No invoices yet.</p>
  const customerName = (invoice: Invoice) => invoice.customer?.company_name ?? invoice.customer_id
  const columns: TableColumn<Invoice>[] = [
    { id: 'number', header: 'Invoice Number', render: (row) => row.invoice_number, sortValue: (row) => row.invoice_number },
    { id: 'customer', header: 'Customer', render: customerName, sortValue: customerName },
    { id: 'total', header: 'Total Amount', render: (row) => row.total_amount, sortValue: (row) => Number(row.total_amount) },
    { id: 'status', header: 'Status', render: (row) => <span className={`status status-${row.status.toLowerCase()}`}>{row.status}</span>, sortValue: (row) => row.status },
    { id: 'created', header: 'Created At', render: (row) => new Date(row.created_at).toLocaleString(), sortValue: (row) => new Date(row.created_at) },
    { id: 'actions', header: 'Actions', sortable: false, render: (row) => <Link to={`/invoices/${row.id}`}>View</Link> },
  ]
  return <Table columns={columns} rows={query.data} getRowKey={(row) => row.id} caption="Invoices" />
}
