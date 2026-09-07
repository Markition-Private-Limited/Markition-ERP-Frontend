import { SalesOrderList } from '../components/SalesOrderList'

export function SalesOrdersPage() {
  return (
    <>
      <h1>Sales Orders</h1>
      <p className="page-description">Sales Orders are created by converting an accepted quotation.</p>
      <SalesOrderList />
    </>
  )
}
