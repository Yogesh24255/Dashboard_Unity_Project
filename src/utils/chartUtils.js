/**
 * Utility functions for chart and data operations
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

export function isSerialLikeHeader(header) {
  const normalized = String(header || '')
    .trim()
    .toLowerCase()
  return (
    normalized === '#' ||
    normalized === 'index' ||
    normalized === 'id' ||
    normalized === 'sr_no' ||
    normalized === 'sr no' ||
    normalized === 'serial' ||
    normalized === 'serial_no' ||
    normalized === 'serial number' ||
    normalized === 's.no'
  )
}

export function areNumberArraysEqual(first = [], second = []) {
  if (first.length !== second.length) {
    return false
  }

  for (let index = 0; index < first.length; index += 1) {
    if (first[index] !== second[index]) {
      return false
    }
  }

  return true
}

export const palette = [
  '#2563eb',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#ec4899',
  '#64748b',
]
