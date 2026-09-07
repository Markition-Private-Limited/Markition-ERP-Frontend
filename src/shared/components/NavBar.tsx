import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../../features/auth/api/auth.api'
import { getApiErrorMessage } from '../lib/axios'
import { useAuth } from '../hooks/useAuth'
export function NavBar() {
  const { user } = useAuth(); const navigate = useNavigate(); const queryClient = useQueryClient()
  const mutation = useMutation({ mutationFn: logout, onSuccess: () => { queryClient.removeQueries({ queryKey: ['auth'] }); navigate('/login', { replace: true }) } })
  return <><nav className="legacy-navbar">
    <NavLink to="/dashboard">Dashboard</NavLink><NavLink to="/categories">Categories</NavLink><NavLink to="/customers">Customers</NavLink><NavLink to="/inventory">Inventory</NavLink><NavLink to="/invoices">Invoices</NavLink>
    <span className="legacy-navbar-user">{user?.email}</span><button onClick={() => mutation.mutate()} disabled={mutation.isPending}>Logout</button>
  </nav>{mutation.isError && <p role="alert">{getApiErrorMessage(mutation.error)}</p>}</>
}
