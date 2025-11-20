'use client'

import { List } from 'react-window'
import { cn } from '@/lib/utils'

export interface VirtualizedTableColumn<T> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render: (item: T, index: number) => React.ReactNode
}

interface VirtualizedTableProps<T> {
  data: T[]
  columns: VirtualizedTableColumn<T>[]
  rowHeight?: number
  height?: number
  className?: string
}

interface RowComponentProps<T> {
  index: number
  style: React.CSSProperties
  data: T[]
  columns: VirtualizedTableColumn<T>[]
}

function RowComponent<T>({ index, style, data, columns }: RowComponentProps<T>) {
  const item = data[index]
  if (!item) return null

  return (
    <div
      style={style}
      className={cn(
        'flex items-center border-b border-bg-tertiary',
        index % 2 === 0 ? 'bg-bg-primary' : 'bg-bg-secondary/30'
      )}
    >
      {columns.map((column) => (
        <div
          key={column.key}
          className={cn(
            'flex-1 px-4 py-3 text-sm',
            column.align === 'right' && 'text-right',
            column.align === 'center' && 'text-center'
          )}
          style={column.width ? { flex: `0 0 ${column.width}`, maxWidth: column.width } : undefined}
        >
          {column.render(item, index)}
        </div>
      ))}
    </div>
  )
}

export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 52,
  height = 600,
  className,
}: VirtualizedTableProps<T>) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-bg-tertiary', className)}>
      {/* Header */}
      <div className="flex border-b border-bg-tertiary bg-bg-secondary">
        {columns.map((column) => (
          <div
            key={column.key}
            className={cn(
              'flex-1 px-4 py-3 text-xs font-bold uppercase text-text-secondary',
              column.align === 'right' && 'text-right',
              column.align === 'center' && 'text-center'
            )}
            style={column.width ? { flex: `0 0 ${column.width}`, maxWidth: column.width } : undefined}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Virtualized Rows */}
      {data.length > 0 ? (
        <div style={{ height }}>
          <List
            rowCount={data.length}
            rowHeight={rowHeight}
            rowProps={{}}
            rowComponent={({ index, style }) => (
              <RowComponent
                index={index}
                style={style}
                data={data}
                columns={columns}
              />
            )}
            style={{ height: '100%' }}
          />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-text-muted">
          No data available
        </div>
      )}
    </div>
  )
}
