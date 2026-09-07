import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../shared/lib/axios'
import { useSignup } from '../hooks/useSignup'
export function SignupForm() {
  const [tenantName, setTenantName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const mutation = useSignup(); const navigate = useNavigate()
  function submit(event: FormEvent) { event.preventDefault(); mutation.mutate({ tenantName, email, password }, { onSuccess: () => navigate('/dashboard', { replace: true }) }) }
  return <form onSubmit={submit} className="erp-form auth-form">
    <label>Company Name <input required minLength={2} value={tenantName} onChange={(e) => setTenantName(e.target.value)} /></label>
    <label>Email <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
    <label>Password
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input type={showPassword ? 'text' : 'password'} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} style={{ flex: 1, paddingRight: '2.5rem' }} />
        <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--color-muted, #94a3b8)', lineHeight: 1 }}>
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
    <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating account...' : 'Sign up'}</button>
    {mutation.isError && <p role="alert">{getApiErrorMessage(mutation.error)}</p>}
    <Link to="/login">Already have an account?</Link>
  </form>
}

function EyeIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}

function EyeOffIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
}
