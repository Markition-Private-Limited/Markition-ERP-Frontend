import { FormEvent, useEffect, useState } from 'react'
import { FormField } from '../../../shared/components/FormField'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { useTaxConfiguration } from '../hooks/useTaxConfiguration'
import { useUpsertTaxConfiguration } from '../hooks/useUpsertTaxConfiguration'

export function TaxConfigurationPage() {
  const { data, isLoading, isError, error } = useTaxConfiguration()
  const mutation = useUpsertTaxConfiguration()

  const isConfigured = data != null && data.tax_name !== null && data.tax_rate !== null

  const [taxName, setTaxName] = useState('')
  const [taxRate, setTaxRate] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (!data) return
    setTaxName(data.tax_name ?? '')
    setTaxRate(data.tax_rate !== null ? String(parseFloat(data.tax_rate)) : '')
  }, [data])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLocalError(null)
    setSavedSuccess(false)

    const rate = Number(taxRate)
    if (!taxName.trim()) {
      setLocalError('Tax name is required.')
      return
    }
    if (taxRate === '' || isNaN(rate)) {
      setLocalError('Tax rate must be a number.')
      return
    }
    if (rate < 0) {
      setLocalError('Tax rate cannot be negative.')
      return
    }

    mutation.mutate(
      { tax_name: taxName.trim(), tax_rate: rate },
      { onSuccess: () => setSavedSuccess(true) },
    )
  }

  if (isLoading) return <p>Loading tax configuration…</p>
  if (isError) return <p role="alert" className="form-field-error">Failed to load tax configuration: {getApiErrorMessage(error)}</p>

  return (
    <>
      <h1>Tax Configuration</h1>

      {!isConfigured && (
        <p style={{ color: 'var(--color-muted, #94a3b8)', marginBottom: '1rem' }}>
          No tax has been configured yet. Set a name and rate below.
        </p>
      )}

      <form onSubmit={handleSubmit} className="erp-form form-narrow">
        <FormField label="Tax Name">
          <input
            value={taxName}
            onChange={(e) => { setTaxName(e.target.value); setLocalError(null) }}
            placeholder="e.g. VAT, GST, Sales Tax"
          />
        </FormField>

        <FormField label="Tax Rate (%)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={taxRate}
            onChange={(e) => { setTaxRate(e.target.value); setLocalError(null) }}
            placeholder="e.g. 15"
          />
        </FormField>

        <p style={{ fontSize: '0.8rem', color: 'var(--color-muted, #94a3b8)', marginTop: '-0.25rem' }}>
          Changing the rate applies to new quotations only — existing quotations are unaffected.
        </p>

        {localError && <p role="alert" className="form-field-error">{localError}</p>}
        {mutation.isError && !localError && (
          <p role="alert" className="form-field-error">{getApiErrorMessage(mutation.error)}</p>
        )}

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save Tax Configuration'}
        </button>

        {savedSuccess && !mutation.isPending && (
          <p role="status" style={{ color: 'var(--color-success, #16a34a)', marginTop: '0.5rem' }}>
            Tax configuration saved successfully.
          </p>
        )}
      </form>

      {isConfigured && (
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-muted, #94a3b8)' }}>
          Current: <strong style={{ color: 'inherit' }}>{data.tax_name}</strong> at <strong style={{ color: 'inherit' }}>{parseFloat(data.tax_rate!)}%</strong>
        </p>
      )}
    </>
  )
}
