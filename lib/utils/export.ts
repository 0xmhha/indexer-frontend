/**
 * Data Export Utilities
 * Provides functions for exporting data to CSV and JSON formats
 */

export type ExportFormat = 'csv' | 'json'

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) {
    return ''
  }

  // Get headers from first object if not provided
  const firstItem = data[0]
  if (!firstItem) {
    return ''
  }
  const columnHeaders = headers || Object.keys(firstItem)

  // Create header row
  const headerRow = columnHeaders.join(',')

  // Create data rows
  const dataRows = data.map((item) => {
    return columnHeaders
      .map((header) => {
        const value = item[header]
        // Handle different value types
        if (value === null || value === undefined) {
          return ''
        }
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Convert array of objects to JSON string with pretty formatting
 */
export function convertToJSON<T>(data: T[]): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: string[]
): void {
  const csv = convertToCSV(data, headers)
  const timestampedFilename = `${filename}_${Date.now()}.csv`
  downloadFile(csv, timestampedFilename, 'text/csv;charset=utf-8;')
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T>(data: T[], filename: string): void {
  const json = convertToJSON(data)
  const timestampedFilename = `${filename}_${Date.now()}.json`
  downloadFile(json, timestampedFilename, 'application/json;charset=utf-8;')
}

/**
 * Export data in specified format
 */
export function exportData<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  format: ExportFormat,
  headers?: string[]
): void {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  switch (format) {
    case 'csv':
      exportToCSV(data, filename, headers)
      break
    case 'json':
      exportToJSON(data, filename)
      break
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}
