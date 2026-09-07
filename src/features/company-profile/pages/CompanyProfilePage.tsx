import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { FormField } from '../../../shared/components/FormField'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { useAuth } from '../../../shared/hooks/useAuth'
import { useCompanyProfile } from '../hooks/useCompanyProfile'
import { useUpdateCompanyProfile } from '../hooks/useUpdateCompanyProfile'
import { useUploadLogo } from '../hooks/useUploadLogo'

export function CompanyProfilePage() {
  const { tenant } = useAuth()
  const { data, isLoading, isError, error } = useCompanyProfile()
  const updateMutation = useUpdateCompanyProfile()
  const logoMutation = useUploadLogo()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [taxNumber, setTaxNumber] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (!data) return
    setName(data.name ?? tenant?.name ?? '')
    setAddress(data.address ?? '')
    setPhone(data.phone ?? '')
    setTaxNumber(data.tax_number ?? '')
    setLogoPreview(data.logo_url ?? null)
  }, [data])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSavedSuccess(false)
    updateMutation.mutate(
      { name: name || undefined, address: address || undefined, phone: phone || undefined, tax_number: taxNumber || undefined },
      { onSuccess: () => setSavedSuccess(true) },
    )
  }

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoPreview(URL.createObjectURL(file))
    setSavedSuccess(false)
    logoMutation.mutate(file)
  }

  if (isLoading) return <p>Loading company profile…</p>
  if (isError) return <p role="alert" className="form-field-error">Failed to load profile: {getApiErrorMessage(error)}</p>

  return (
    <>
      <h1>Company Profile</h1>
      <form onSubmit={handleSubmit} className="erp-form form-narrow">
        <section style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            {logoPreview
              ? <img src={logoPreview} alt="Company logo" style={{ width: 80, height: 80, objectFit: 'contain', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: 6 }} />
              : <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-2, #f1f5f9)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: 6, color: 'var(--color-muted, #94a3b8)', fontSize: '0.75rem', textAlign: 'center' }}>No logo</div>
            }
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
              <button type="button" className="button-secondary" onClick={() => fileInputRef.current?.click()} disabled={logoMutation.isPending}>
                {logoMutation.isPending ? 'Uploading…' : 'Upload Logo'}
              </button>
              {logoMutation.isError && <p role="alert" className="form-field-error" style={{ marginTop: '0.25rem' }}>{getApiErrorMessage(logoMutation.error)}</p>}
            </div>
          </div>
        </section>

        <FormField label="Company Name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Wholesale Ltd" />
        </FormField>
        <FormField label="Address">
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, Karachi" rows={3} style={{ resize: 'vertical' }} />
        </FormField>
        <FormField label="Phone">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92-21-1234567" />
        </FormField>
        <FormField label="Tax Registration Number">
          <input value={taxNumber} onChange={(e) => setTaxNumber(e.target.value)} placeholder="NTN-1234567-8" />
        </FormField>

        <button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving…' : 'Save Profile'}
        </button>

        {savedSuccess && !updateMutation.isPending && (
          <p role="status" style={{ color: 'var(--color-success, #16a34a)', marginTop: '0.5rem' }}>Profile saved successfully.</p>
        )}
        {updateMutation.isError && (
          <p role="alert" className="form-field-error" style={{ marginTop: '0.5rem' }}>{getApiErrorMessage(updateMutation.error)}</p>
        )}
      </form>
    </>
  )
}
