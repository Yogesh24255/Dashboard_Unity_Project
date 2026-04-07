import { useEffect, useMemo, useState } from 'react'
import { areNumberArraysEqual, isSerialLikeHeader } from '../utils/chartUtils'
import {
  ROWS_PER_PAGE,
  createSequentialIndices,
  getRowLabel,
  getStartIndex,
  getTotalPages,
  isSelectionCountValid,
  parseNumericValue,
} from '../utils/dashboardCommon'

export function useDashboard1(csvHeaders, csvRows) {
  const [chartType, setChartType] = useState('bar')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategoryHeader, setSelectedCategoryHeader] = useState('')
  const [selectedMetricHeader, setSelectedMetricHeader] = useState('')
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)
  const [draftSelectedIndices, setDraftSelectedIndices] = useState([])
  const [appliedSelectedIndices, setAppliedSelectedIndices] = useState(null)

  const usableHeaders = useMemo(
    () => csvHeaders.filter((header) => header && !isSerialLikeHeader(header)),
    [csvHeaders],
  )

  useEffect(() => {
    if (!usableHeaders.length) {
      setSelectedCategoryHeader('')
      setSelectedMetricHeader('')
      return
    }

    const defaultCategory = usableHeaders[0]
    const defaultMetric = usableHeaders.find((header) => header !== defaultCategory) || defaultCategory

    setSelectedCategoryHeader(defaultCategory)
    setSelectedMetricHeader((previous) =>
      previous && usableHeaders.includes(previous) ? previous : defaultMetric,
    )
  }, [usableHeaders])

  const metricHeaderOptions = useMemo(() => {
    const withoutCategory = usableHeaders.filter((header) => header !== selectedCategoryHeader)
    return withoutCategory.length ? withoutCategory : usableHeaders
  }, [usableHeaders, selectedCategoryHeader])

  useEffect(() => {
    if (!metricHeaderOptions.length) {
      setSelectedMetricHeader('')
      return
    }

    if (!metricHeaderOptions.includes(selectedMetricHeader)) {
      setSelectedMetricHeader(metricHeaderOptions[0])
    }
  }, [metricHeaderOptions, selectedMetricHeader])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategoryHeader, selectedMetricHeader])

  const categoryColumnIndex = useMemo(
    () => csvHeaders.findIndex((header) => header === selectedCategoryHeader),
    [csvHeaders, selectedCategoryHeader],
  )

  const metricColumnIndex = useMemo(
    () => csvHeaders.findIndex((header) => header === selectedMetricHeader),
    [csvHeaders, selectedMetricHeader],
  )

  const dashboardOneRows = useMemo(() => {
    if (categoryColumnIndex < 0 || metricColumnIndex < 0) {
      return []
    }

    return csvRows.map((row, rowIndex) => {
      const label = getRowLabel(row[categoryColumnIndex], rowIndex)
      const numericValue = parseNumericValue(row[metricColumnIndex], 0)

      return {
        label,
        metricValue: Number.isFinite(numericValue) ? numericValue : 0,
      }
    })
  }, [csvRows, categoryColumnIndex, metricColumnIndex])

  const totalPages = getTotalPages(dashboardOneRows.length, ROWS_PER_PAGE)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const startIndex = getStartIndex(currentPage, ROWS_PER_PAGE)
  const paginatedRows = dashboardOneRows.slice(startIndex, startIndex + ROWS_PER_PAGE)
  const pageRowIndices = useMemo(() => {
    const remainingRows = Math.max(0, dashboardOneRows.length - startIndex)
    const count = Math.min(ROWS_PER_PAGE, remainingRows)
    return createSequentialIndices(count, startIndex)
  }, [dashboardOneRows.length, startIndex])

  useEffect(() => {
    if (appliedSelectedIndices === null && !isCustomizeOpen) {
      setDraftSelectedIndices((previous) =>
        areNumberArraysEqual(previous, pageRowIndices) ? previous : pageRowIndices,
      )
    }
  }, [pageRowIndices, appliedSelectedIndices, isCustomizeOpen])

  useEffect(() => {
    setDraftSelectedIndices((previous) => {
      const filteredDraft = previous.filter((index) => index < dashboardOneRows.length)
      return areNumberArraysEqual(previous, filteredDraft) ? previous : filteredDraft
    })
    setAppliedSelectedIndices((previous) => {
      if (previous === null) {
        return null
      }

      const filtered = previous.filter((index) => index < dashboardOneRows.length)
      if (!filtered.length) {
        return null
      }

      return areNumberArraysEqual(previous, filtered) ? previous : filtered
    })
  }, [dashboardOneRows.length])

  const displayedRows = useMemo(() => {
    if (appliedSelectedIndices === null) {
      return paginatedRows
    }

    return appliedSelectedIndices.map((index) => dashboardOneRows[index]).filter(Boolean)
  }, [appliedSelectedIndices, dashboardOneRows, paginatedRows])

  const chartLabels = displayedRows.map((row) => row.label)
  const chartValues = displayedRows.map((row) => row.metricValue)
  const isDraftSelectionValid = isSelectionCountValid(draftSelectedIndices.length, 3, 10)

  const handleToggleDraftRow = (rowIndex) => {
    setDraftSelectedIndices((previous) => {
      if (previous.includes(rowIndex)) {
        return previous.filter((index) => index !== rowIndex)
      }

      if (previous.length >= 10) {
        return previous
      }

      return [...previous, rowIndex].sort((first, second) => first - second)
    })
  }

  const handleClearSelection = () => {
    setDraftSelectedIndices([])
  }

  const handleApplySelection = () => {
    if (!isDraftSelectionValid) {
      return
    }

    setAppliedSelectedIndices([...draftSelectedIndices].sort((first, second) => first - second))
    setCurrentPage(1)
    setIsCustomizeOpen(false)
  }

  const handleResetToDefault = () => {
    const defaultPageIndices = createSequentialIndices(
      Math.min(ROWS_PER_PAGE, dashboardOneRows.length),
    )
    setAppliedSelectedIndices(null)
    setDraftSelectedIndices(defaultPageIndices)
    setCurrentPage(1)
    setIsCustomizeOpen(false)
  }

  return {
    state: {
      chartType,
      currentPage,
      selectedCategoryHeader,
      selectedMetricHeader,
      isCustomizeOpen,
      draftSelectedIndices,
      appliedSelectedIndices,
    },
    handlers: {
      setChartType,
      setCurrentPage,
      setSelectedMetricHeader,
      setIsCustomizeOpen,
      handleToggleDraftRow,
      handleClearSelection,
      handleApplySelection,
      handleResetToDefault,
    },
    data: {
      usableHeaders,
      metricHeaderOptions,
      dashboardOneRows,
      totalPages,
      paginatedRows,
      displayedRows,
      chartLabels,
      chartValues,
    },
  }
}
