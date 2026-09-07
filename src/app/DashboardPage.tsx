import { Link } from 'react-router-dom'
import { useAuth } from '../shared/hooks/useAuth'
export function DashboardPage() {
  const { user, tenant } = useAuth()
  return <><h1>Dashboard</h1><p>Welcome, {user?.email} — {tenant?.name}</p><p><Link to="/customers">Customers</Link> | <Link to="/inventory">Inventory</Link> | <Link to="/invoices">Invoices</Link></p></>
}
