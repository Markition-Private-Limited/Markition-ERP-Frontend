import { ReactNode, useMemo, useState } from 'react'

type SortDirection = 'asc' | 'desc'
type SortValue = string | number | boolean | Date | null | undefined

export interface TableColumn<Row> {
  id: string
  header: ReactNode
  render: (row: Row) => ReactNode
  sortValue?: (row: Row) => SortValue
  sortable?: boolean
}

interface TableProps<Row> {
  columns: TableColumn<Row>[]
  rows: Row[]
  getRowKey: (row: Row) => string | number
  caption?: string
}

function compareValues(left: SortValue, right: SortValue) {
  if (left == null) return right == null ? 0 : 1
  if (right == null) return -1
  const a = left instanceof Date ? left.getTime() : left
  const b = right instanceof Date ? right.getTime() : right
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

export function Table<Row>({ columns, rows, getRowKey, caption }: TableProps<Row>) {
  const [sort, setSort] = useState<{ id: string; direction: SortDirection } | null>(null)
  const sortedRows = useMemo(() => {
    if (!sort) return rows
    const column = columns.find((item) => item.id === sort.id)
    if (!column?.sortValue) return rows
    const direction = sort.direction === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => compareValues(column.sortValue!(a), column.sortValue!(b)) * direction)
  }, [columns, rows, sort])

  function toggleSort(column: TableColumn<Row>) {
    if (column.sortable === false || !column.sortValue) return
    setSort((current) => current?.id === column.id
      ? { id: column.id, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { id: column.id, direction: 'asc' })
  }

  return <div className="table-scroll">
    <table className="data-table">
      {caption && <caption>{caption}</caption>}
      <thead><tr>{columns.map((column) => {
        const sortable = column.sortable !== false && Boolean(column.sortValue)
        const active = sort?.id === column.id
        return <th key={column.id} scope="col" aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}>
          {sortable ? <button type="button" className="sort-button" onClick={() => toggleSort(column)}>
            <span>{column.header}</span><span aria-hidden="true">{active ? (sort.direction === 'asc' ? '▲' : '▼') : '↕'}</span>
          </button> : column.header}
        </th>
      })}</tr></thead>
      <tbody>{sortedRows.map((row) => <tr key={getRowKey(row)}>{columns.map((column) => <td key={column.id}>{column.render(row)}</td>)}</tr>)}</tbody>
    </table>
  </div>
}
