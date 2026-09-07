import { ReactNode } from 'react'

interface FormFieldProps {
  label: ReactNode
  children: ReactNode
  error?: ReactNode
}

export function FormField({ label, children, error }: FormFieldProps) {
  return <label className="form-field">
    <span className="form-field-label">{label}</span>
    {children}
    {error && <span className="form-field-error" role="alert">{error}</span>}
  </label>
}
