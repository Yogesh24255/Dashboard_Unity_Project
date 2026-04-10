import * as XLSX from 'xlsx'

const CACHE_KEY = 'default_csv_dataset'

export function getCachedDataset() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

export function setCachedDataset(headers, rows) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ headers, rows }))
  } catch {
    // Silently fail if sessionStorage is unavailable
  }
}

export function parseCsvText(text) {
  const detectDelimiter = (sourceText) => {
    let firstLine = ''
    let insideQuotes = false

    for (let index = 0; index < sourceText.length; index += 1) {
      const char = sourceText[index]
      const nextChar = sourceText[index + 1]

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          firstLine += '"'
          index += 1
        } else {
          insideQuotes = !insideQuotes
        }
        continue
      }

      if ((char === '\n' || char === '\r') && !insideQuotes) {
        break
      }

      firstLine += char
    }

    const commaCount = (firstLine.match(/,/g) || []).length
    const semicolonCount = (firstLine.match(/;/g) || []).length
    const tabCount = (firstLine.match(/\t/g) || []).length

    if (semicolonCount > commaCount && semicolonCount >= tabCount) {
      return ';'
    }

    if (tabCount > commaCount && tabCount > semicolonCount) {
      return '\t'
    }

    return ','
  }

  const delimiter = detectDelimiter(text)
  const rows = []
  let currentRow = []
  let currentCell = ''
  let insideQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"'
        index += 1
      } else {
        insideQuotes = !insideQuotes
      }
      continue
    }

    if (char === delimiter && !insideQuotes) {
      currentRow.push(currentCell.trim())
      currentCell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1
      }

      currentRow.push(currentCell.trim())
      const hasValues = currentRow.some((value) => value !== '')
      if (hasValues) {
        rows.push(currentRow)
      }

      currentRow = []
      currentCell = ''
      continue
    }

    currentCell += char
  }

  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    const hasValues = currentRow.some((value) => value !== '')
    if (hasValues) {
      rows.push(currentRow)
    }
  }

  return rows
}

export function isNumericValue(value) {
  if (value === null || value === undefined) {
    return false
  }

  const normalized = String(value).trim().replace(/,/g, '')
  if (normalized === '') {
    return false
  }

  return !Number.isNaN(Number(normalized))
}

export function buildDatasetFromCsvText(text) {
  const parsedRows = parseCsvText(text)

  if (parsedRows.length === 0) {
    return { headers: [], rows: [], error: 'CSV file is empty or not readable.' }
  }

  const [headers, ...dataRows] = parsedRows
  const maxRowLength = dataRows.reduce((longest, row) => Math.max(longest, row.length), headers.length)
  const columnCount = Math.max(1, maxRowLength)

  const normalizedHeaders = Array.from({ length: columnCount }, (_, index) => {
    const headerValue = headers[index] ?? ''
    return headerValue || `Column ${index + 1}`
  })

  const normalizedRows = dataRows.map((row) => {
    const cells = [...row]
    while (cells.length < columnCount) {
      cells.push('')
    }
    return cells.slice(0, columnCount)
  })

  return { headers: normalizedHeaders, rows: normalizedRows, error: '' }
}

export function downloadDatasetAsExcel(headers, rows, sourceFileName) {
  if (!headers.length) {
    return
  }

  const aoa = [headers, ...rows]
  const worksheet = XLSX.utils.aoa_to_sheet(aoa)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DashboardData')

  const fileBase = sourceFileName ? sourceFileName.replace(/\.csv$/i, '') : 'dashboard-data'
  XLSX.writeFile(workbook, `${fileBase}.xlsx`)
}
