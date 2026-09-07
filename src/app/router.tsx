import { Navigate, createBrowserRouter } from 'react-router-dom'
import { LoginPage, SignupPage } from '../features/auth'
import { CategoriesPage } from '../features/categories'
import { CompanyProfilePage } from '../features/company-profile'
import { TaxConfigurationPage } from '../features/tax-configuration'
import { CustomersPage } from '../features/customers'
import { InventoryPage, ProductDetailPage } from '../features/inventory'
import { InvoiceDetailPage, InvoicesPage } from '../features/invoicing'
import { QuotationsPage } from '../features/quotations'
import { SalesOrdersPage } from '../features/sales-orders'
import { AppShell } from '../shared/components/AppShell'
import { ProtectedRoute } from '../shared/components/ProtectedRoute'
import { useAuth } from '../shared/hooks/useAuth'
import { DashboardPage } from './DashboardPage'

function HomeRedirect() {
  const { user, isPending } = useAuth()
  if (isPending) return <p>Loading...</p>
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

export const router = createBrowserRouter([
  { path: '/', element: <HomeRedirect /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { element: <ProtectedRoute />, children: [{ element: <AppShell />, children: [
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/categories', element: <CategoriesPage /> },
    { path: '/customers', element: <CustomersPage /> },
    { path: '/inventory', element: <InventoryPage /> },
    { path: '/inventory/:id', element: <ProductDetailPage /> },
    { path: '/quotations', element: <QuotationsPage /> },
    { path: '/sales-orders', element: <SalesOrdersPage /> },
    { path: '/invoices', element: <InvoicesPage /> },
    { path: '/invoices/:id', element: <InvoiceDetailPage /> },
    { path: '/settings/company-profile', element: <CompanyProfilePage /> },
    { path: '/settings/tax-configuration', element: <TaxConfigurationPage /> },
  ] }] },
])
