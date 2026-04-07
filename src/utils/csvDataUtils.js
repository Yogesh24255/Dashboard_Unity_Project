import * as XLSX from 'xlsx'

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

function parseNumeric(value) {
  return Number(String(value).trim().replace(/,/g, ''))
}

function aggregateByFirstColumn(rows, columnCount) {
  const groupedRows = new Map()

  rows.forEach((row) => {
    const groupKey = (row[0] || '').trim() || 'Unknown'

    if (!groupedRows.has(groupKey)) {
      groupedRows.set(groupKey, {
        key: groupKey,
        sums: Array(columnCount).fill(0),
        hasNumeric: Array(columnCount).fill(false),
        textValues: Array(columnCount).fill(''),
      })
    }

    const group = groupedRows.get(groupKey)

    for (let columnIndex = 1; columnIndex < columnCount; columnIndex += 1) {
      const rawValue = row[columnIndex] ?? ''
      const cellValue = String(rawValue).trim()

      if (isNumericValue(cellValue)) {
        group.sums[columnIndex] += parseNumeric(cellValue)
        group.hasNumeric[columnIndex] = true
      } else if (cellValue !== '') {
        if (group.textValues[columnIndex] === '') {
          group.textValues[columnIndex] = cellValue
        } else if (group.textValues[columnIndex] !== cellValue) {
          group.textValues[columnIndex] = 'Mixed'
        }
      }
    }
  })

  return Array.from(groupedRows.values()).map((group) => {
    const aggregatedRow = Array(columnCount).fill('')
    aggregatedRow[0] = group.key

    for (let columnIndex = 1; columnIndex < columnCount; columnIndex += 1) {
      if (group.hasNumeric[columnIndex]) {
        aggregatedRow[columnIndex] = String(group.sums[columnIndex])
      } else {
        aggregatedRow[columnIndex] = group.textValues[columnIndex]
      }
    }

    return aggregatedRow
  })
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

  const aggregatedRows = aggregateByFirstColumn(normalizedRows, columnCount)

  return { headers: normalizedHeaders, rows: aggregatedRows, error: '' }
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
