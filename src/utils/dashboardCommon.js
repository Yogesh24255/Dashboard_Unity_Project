export const ROWS_PER_PAGE = 10

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
