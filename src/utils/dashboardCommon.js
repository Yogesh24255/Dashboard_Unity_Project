export const ROWS_PER_PAGE = 10

export function aggregateRowsByFirstColumn(rows, columnCount) {
  if (!rows.length || columnCount <= 0) {
    return []
  }

  const groupedRows = new Map()

  rows.forEach((row) => {
    const key = String(row[0] ?? '').trim() || 'Unknown'

    if (!groupedRows.has(key)) {
      groupedRows.set(key, {
        key,
        sums: Array(columnCount).fill(0),
        hasNumeric: Array(columnCount).fill(false),
        textValues: Array(columnCount).fill(''),
      })
    }

    const group = groupedRows.get(key)

    for (let columnIndex = 1; columnIndex < columnCount; columnIndex += 1) {
      const cellValue = String(row[columnIndex] ?? '').trim()
      const numeric = parseNumericValue(cellValue, NaN)

      if (Number.isFinite(numeric)) {
        group.sums[columnIndex] += numeric
        group.hasNumeric[columnIndex] = true
      } else if (cellValue) {
        if (!group.textValues[columnIndex]) {
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

export function parseNumericValue(value, fallback = 0) {
  const numeric = Number(String(value ?? '').replace(/,/g, ''))
  return Number.isFinite(numeric) ? numeric : fallback
}

export function getRowLabel(value, rowIndex) {
  return value || `Row ${rowIndex + 1}`
}

export function getTotalPages(totalItems, pageSize) {
  return Math.max(1, Math.ceil(totalItems / pageSize))
}

export function getStartIndex(currentPage, pageSize) {
  return (currentPage - 1) * pageSize
}

export function createSequentialIndices(count, offset = 0) {
  return Array.from({ length: Math.max(0, count) }, (_, index) => offset + index)
}

export function isSelectionCountValid(count, min, max) {
  return count >= min && count <= max
}
