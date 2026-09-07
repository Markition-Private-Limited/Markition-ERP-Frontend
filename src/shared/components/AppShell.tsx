import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../../features/auth/api/auth.api'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../lib/axios'

type NavItem = { label: string; to: string }
type NavGroup = { label: string; children: NavItem[] }
type NavEntry = NavItem | NavGroup

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry
}

const navigation: NavEntry[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Sales & Customers', children: [
    { label: 'Customers', to: '/customers' },
    { label: 'Quotations', to: '/quotations' },
  ]},
  { label: 'Sales Orders', to: '/sales-orders' },
  { label: 'Invoices', to: '/invoices' },
  { label: 'Inventory', children: [
    { label: 'Products', to: '/inventory' },
    { label: 'Categories', to: '/categories' },
  ]},
  { label: 'Settings', children: [
    { label: 'Company Profile', to: '/settings/company-profile' },
    { label: 'Tax Configuration', to: '/settings/tax-configuration' },
  ]},
]

function childIsActive(child: NavItem, pathname: string) {
  return pathname === child.to || pathname.startsWith(child.to + '/')
}

function NavGroupItem({ group }: { group: NavGroup }) {
  const location = useLocation()
  const hasActive = group.children.some(c => childIsActive(c, location.pathname))
  const [open, setOpen] = useState(hasActive)

  const isOpen = open || hasActive

  return (
    <div className="sidebar-group">
      <button
        type="button"
        className={`sidebar-group-header${hasActive ? ' has-active' : ''}`}
        aria-expanded={isOpen}
        onClick={() => setOpen(o => !o)}
      >
        <span>{group.label}</span>
        <svg
          className={`sidebar-chevron${isOpen ? ' open' : ''}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          aria-hidden="true"
        >
          <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isOpen && (
        <div className="sidebar-group-children">
          {group.children.map(child => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) => `sidebar-link sidebar-child-link${isActive ? ' active' : ''}`}
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export function AppShell() {
  const { user, tenant } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['auth'] })
      navigate('/login', { replace: true })
    },
  })

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-brand">ERP</div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigation.map((entry, i) =>
          isGroup(entry)
            ? <NavGroupItem key={entry.label} group={entry} />
            : <NavLink key={entry.to} to={entry.to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                {entry.label}
              </NavLink>
        )}
      </nav>
    </aside>
    <div className="app-frame">
      <header className="topbar">
        <strong className="tenant-name">{tenant?.name ?? 'ERP Workspace'}</strong>
        <div className="topbar-user">
          <span>{user?.email}</span>
          <button type="button" className="button-secondary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>
      {mutation.isError && <p className="shell-alert" role="alert">{getApiErrorMessage(mutation.error)}</p>}
      <main className="main-area"><div className="content-container"><Outlet /></div></main>
    </div>
  </div>
}
