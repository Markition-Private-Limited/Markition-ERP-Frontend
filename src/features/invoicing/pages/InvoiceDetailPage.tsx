import { useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { InvoiceDetail } from '../components/InvoiceDetail'
import { useInvoice } from '../hooks/useInvoices'
export function InvoiceDetailPage() {
  const { id = '' } = useParams(); const query = useInvoice(id)
  if (query.isPending) return <p>Loading...</p>
  if (query.isError) return <p role="alert">{getApiErrorMessage(query.error)}</p>
  return <InvoiceDetail invoice={query.data} />
}
