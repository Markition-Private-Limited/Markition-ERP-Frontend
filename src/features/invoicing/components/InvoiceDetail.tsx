import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Table, type TableColumn } from '../../../shared/components/Table'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import type { Invoice, InvoiceItem } from '../../../shared/types'
import { invoicingApi } from '../api/invoicing.api'

function amount(value: string) {
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const pdfUrlRef = useRef<string>()

  useEffect(() => () => {
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
  }, [])

  async function previewPdf() {
    setIsPdfLoading(true)
    setPdfError('')
    const previewWindow = window.open('', '_blank')

    try {
      const response = await invoicingApi.getPdf(invoice.id)
      if (!response.data.type.toLowerCase().includes('application/pdf')) {
        throw new Error('The server did not return a PDF document.')
      }
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
      const pdfUrl = URL.createObjectURL(response.data)
      pdfUrlRef.current = pdfUrl
      if (!previewWindow) {
        throw new Error('The PDF preview was blocked. Allow pop-ups for this site and try again.')
      }
      previewWindow.opener = null
      previewWindow.location.href = pdfUrl
    } catch (error) {
      previewWindow?.close()
      setPdfError(error instanceof Error && error.message.includes('PDF') ? error.message : `PDF generation failed: ${getApiErrorMessage(error)}`)
    } finally {
      setIsPdfLoading(false)
    }
  }

  const columns: TableColumn<InvoiceItem>[] = [
    { id: 'product', header: 'Product Name', render: (item) => item.product?.name ?? item.product_id, sortValue: (item) => item.product?.name },
    {
      id: 'quantity', header: 'Quantity', sortValue: (item) => Number(item.quantity),
      render: (item) => {
        if (item.product?.tracking_type !== 'SERIALIZED') return item.quantity
        const serials = invoice.soldUnits?.filter((unit) => unit.product_id === item.product_id) ?? []
        return serials.length ? serials.map((unit) => <div key={unit.id}>Serial: {unit.serial_number}</div>) : 'Serial: —'
      },
    },
    { id: 'unitPrice', header: 'Unit Price', render: (item) => amount(item.unit_price), sortValue: (item) => Number(item.unit_price) },
    { id: 'lineTotal', header: 'Line Total', render: (item) => amount(item.line_total), sortValue: (item) => Number(item.line_total) },
  ]

  return <article className="invoice-detail">
    <Link to="/invoices" className="back-link">← Back to Invoices</Link>
    <header className="invoice-header">
      <div><h1>Invoice {invoice.invoice_number}</h1><p>Created {new Date(invoice.created_at).toLocaleString()}</p></div>
      <div className="table-actions">
        <span className={`status status-${invoice.status.toLowerCase()}`}>{invoice.status}</span>
        <button type="button" onClick={previewPdf} disabled={isPdfLoading}>
          {isPdfLoading ? 'Generating PDF...' : 'Preview / Download PDF'}
        </button>
      </div>
    </header>
    {pdfError && <p role="alert" className="form-field-error">{pdfError}</p>}
    <section className="invoice-info">
      <div>
        <h2>Customer</h2>
        <p><strong>{invoice.customer?.company_name ?? invoice.customer_id}</strong></p>
        <p>{invoice.customer?.email ?? 'No email provided'}</p>
        <p>{invoice.customer?.phone ?? 'No phone provided'}</p>
      </div>
      <dl className="invoice-totals">
        <div><dt>Subtotal</dt><dd>{amount(invoice.subtotal)}</dd></div>
        <div><dt>Tax Amount</dt><dd>{amount(invoice.tax_amount)}</dd></div>
        <div className="invoice-total"><dt>Total Amount</dt><dd>{amount(invoice.total_amount)}</dd></div>
      </dl>
    </section>
    <section className="detail-section">
      <h2>Line Items</h2>
      <Table columns={columns} rows={invoice.items} getRowKey={(item) => item.id} caption="Invoice line items" />
    </section>
  </article>
}
