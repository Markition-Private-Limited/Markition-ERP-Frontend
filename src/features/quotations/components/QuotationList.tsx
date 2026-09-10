import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { Table, type TableColumn } from '../../../shared/components/Table'
import type { Quotation } from '../../../shared/types'
import { useQuotations } from '../hooks/useQuotations'
import { useUpdateQuotationStatus } from '../hooks/useUpdateQuotationStatus'
import { useConvertToSalesOrder } from '../hooks/useConvertToSalesOrder'

function QuotationRowActions({ quotation }: { quotation: Quotation }) {
  const navigate = useNavigate()
  const statusMutation = useUpdateQuotationStatus()
  const convertMutation = useConvertToSalesOrder()
  const isPending = statusMutation.isPending || convertMutation.isPending
  const error = statusMutation.isError
    ? getApiErrorMessage(statusMutation.error)
    : convertMutation.isError
    ? getApiErrorMessage(convertMutation.error)
    : null

  return (
    <div className="table-actions">
      {quotation.status === 'DRAFT' && (
        <button type="button" disabled={isPending} onClick={() => statusMutation.mutate({ id: quotation.id, status: 'SENT' })}>
          Send
        </button>
      )}
      {quotation.status === 'SENT' && (
        <>
          <button type="button" disabled={isPending} onClick={() => statusMutation.mutate({ id: quotation.id, status: 'ACCEPTED' })}>
            Mark Accepted
          </button>
          <button type="button" disabled={isPending} onClick={() => statusMutation.mutate({ id: quotation.id, status: 'REJECTED' })}>
            Mark Rejected
          </button>
        </>
      )}
      {quotation.status === 'ACCEPTED' && !quotation.converted_to_sales_order_id && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => convertMutation.mutate(quotation.id, { onSuccess: () => navigate('/sales-orders') })}
        >
          {convertMutation.isPending ? 'Converting...' : 'Convert to Sales Order'}
        </button>
      )}
      {error && <span className="form-field-error" role="alert">{error}</span>}
    </div>
  )
}

export function QuotationList() {
  const query = useQuotations()
  if (query.isPending) return <p>Loading...</p>
  if (query.isError) return <p role="alert">{getApiErrorMessage(query.error)}</p>
  const activeQuotations = query.data.filter((quotation) => !quotation.converted_to_sales_order_id)
  if (!activeQuotations.length) return <p>No quotations yet.</p>

  const customerName = (q: Quotation) => q.customer?.company_name ?? q.customer_id

  const columns: TableColumn<Quotation>[] = [
    { id: 'number', header: 'Quotation Number', render: (row) => row.quotation_number, sortValue: (row) => row.quotation_number },
    { id: 'customer', header: 'Customer', render: customerName, sortValue: customerName },
    { id: 'total', header: 'Total', render: (row) => row.total_amount, sortValue: (row) => Number(row.total_amount) },
    { id: 'status', header: 'Status', render: (row) => <span className={`status status-${row.status.toLowerCase()}`}>{row.status}</span>, sortValue: (row) => row.status },
    { id: 'created', header: 'Created At', render: (row) => new Date(row.created_at).toLocaleString(), sortValue: (row) => new Date(row.created_at) },
    { id: 'actions', header: 'Actions', sortable: false, render: (row) => <QuotationRowActions quotation={row} /> },
  ]

  return <Table columns={columns} rows={activeQuotations} getRowKey={(row) => row.id} caption="Quotations" />
}
