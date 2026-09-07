import { InvoiceList } from '../components/InvoiceList'

export function InvoicesPage() {
  return (
    <>
      <h1>Invoices</h1>
      <p className="page-description">Invoices are generated from Sales Orders. Go to <a href="/sales-orders">Sales Orders</a> to generate one.</p>
      <InvoiceList />
    </>
  )
}
