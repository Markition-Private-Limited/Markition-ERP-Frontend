import { ReactNode, SelectHTMLAttributes, useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'

const CREATE_VALUE = '__inline_create__'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function requireServerUuid(value: unknown, recordType: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new Error(`Cannot select the new ${recordType}: server returned invalid ID ${JSON.stringify(value)}.`)
  }
  return value
}

interface ReferenceSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  createLabel: string
  dialogTitle: string
  onChange: (value: string) => void
  renderCreateForm: (onCreated: (id: string) => void) => ReactNode
}

export function ReferenceSelect({ createLabel, dialogTitle, onChange, renderCreateForm, children, ...props }: ReferenceSelectProps) {
  const [open, setOpen] = useState(false)
  const [selectionError, setSelectionError] = useState('')
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return <>
    <select {...props} onChange={(event) => {
      if (event.target.value === CREATE_VALUE) {
        setSelectionError('')
        setOpen(true)
      }
      else onChange(event.target.value)
    }}>
      {children}
      <option value={CREATE_VALUE}>+ Create new {createLabel}</option>
    </select>
    {open && createPortal(
      <div className="inline-create-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
        <section className="inline-create-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <div className="inline-create-header">
            <h2 id={titleId}>{dialogTitle}</h2>
            <button type="button" className="button-secondary" aria-label="Close" onClick={() => setOpen(false)}>Close</button>
          </div>
          {renderCreateForm((id) => {
            try {
              // The unmodified ID returned by the shared create function is the only value selected.
              onChange(requireServerUuid(id, createLabel))
              setOpen(false)
            } catch (error) {
              setSelectionError(error instanceof Error ? error.message : `Cannot select the new ${createLabel}.`)
            }
          })}
          {selectionError && <p role="alert">{selectionError}</p>}
        </section>
      </div>,
      document.body,
    )}
  </>
}
