import { useState } from 'react'
import { QuotationForm } from '../components/QuotationForm'
import { QuotationList } from '../components/QuotationList'

export function QuotationsPage() {
  const [showForm, setShowForm] = useState(false)
  const [createdNumber, setCreatedNumber] = useState<string | null>(null)

  return (
    <>
      <h1>Quotations</h1>
      <button onClick={() => { setShowForm((v) => !v); setCreatedNumber(null) }}>
        {showForm ? 'Cancel' : 'New Quotation'}
      </button>
      {showForm && (
        <QuotationForm
          onSuccess={(quotation) => {
            setShowForm(false)
            setCreatedNumber(quotation.quotation_number)
          }}
        />
      )}
      {createdNumber && <p>Quotation {createdNumber} created as Draft.</p>}
      <QuotationList />
    </>
  )
}
