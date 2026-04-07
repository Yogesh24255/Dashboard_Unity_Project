import { useEffect, useMemo, useState } from 'react'
import { isSerialLikeHeader, palette } from '../utils/chartUtils'
import {
  ROWS_PER_PAGE,
  createSequentialIndices,
  getRowLabel,
  getStartIndex,
  getTotalPages,
  isSelectionCountValid,
  parseNumericValue,
} from '../utils/dashboardCommon'

export function useDashboard2(csvHeaders, csvRows) {
  const [isD2Open, setIsD2Open] = useState(false)
  const [d2DraftMetrics, setD2DraftMetrics] = useState([])
  const [d2AppliedMetrics, setD2AppliedMetrics] = useState(null)
  const [d2CurrentPage, setD2CurrentPage] = useState(1)
  const [d2ChartType, setD2ChartType] = useState('bar')
  const [isD2CustomizeOpen, setIsD2CustomizeOpen] = useState(false)
  const [d2DraftLabelIndices, setD2DraftLabelIndices] = useState([])
  const [d2AppliedLabelIndices, setD2AppliedLabelIndices] = useState(null)

  const usableHeaders = useMemo(
    () => csvHeaders.filter((header) => header && !isSerialLikeHeader(header)),
    [csvHeaders],
  )

  const d2LabelHeader = usableHeaders[0] || ''

  const d2MetricHeaders = useMemo(() => {
    if (!csvRows.length || !csvHeaders.length) {
      return []
    }

    return csvHeaders.filter((header) => {
      if (!header || isSerialLikeHeader(header) || header === d2LabelHeader) {
        return false
      }

      const sampleValues = csvRows
        .slice(0, 20)
        .map((row) => row[csvHeaders.indexOf(header)])
        .filter((v) => v !== '' && v !== null && v !== undefined)

      const numericCount = sampleValues.filter((v) => Number.isFinite(parseNumericValue(v, NaN))).length

      return sampleValues.length > 0 && numericCount / sampleValues.length >= 0.5
    })
  }, [csvHeaders, csvRows, d2LabelHeader])

  useEffect(() => {
    if (!d2MetricHeaders.length) {
      return
    }

    setD2DraftMetrics((previous) => {
      const valid = previous.filter((h) => d2MetricHeaders.includes(h))
      return valid.length ? valid : d2MetricHeaders.slice(0, 1)
    })

    setD2AppliedMetrics((previous) => {
      if (previous === null) {
        return d2MetricHeaders.slice(0, 1)
      }

      const valid = previous.filter((h) => d2MetricHeaders.includes(h))
      return valid.length ? valid : d2MetricHeaders.slice(0, 1)
    })
  }, [d2MetricHeaders])

  const d2LabelColumnIndex = csvHeaders.indexOf(d2LabelHeader)

  const d2AllRows = useMemo(() => {
    if (d2LabelColumnIndex < 0 || !d2AppliedMetrics || !d2AppliedMetrics.length) {
      return []
    }

    return csvRows.map((row, rowIndex) => {
      const label = getRowLabel(row[d2LabelColumnIndex], rowIndex)
      const values = d2AppliedMetrics.map((header) => {
        const colIndex = csvHeaders.indexOf(header)
        const raw = colIndex >= 0 ? row[colIndex] : '0'
        const numeric = parseNumericValue(raw, 0)
        return Number.isFinite(numeric) ? numeric : 0
      })

      return { label, values }
    })
  }, [csvRows, d2LabelColumnIndex, d2AppliedMetrics, csvHeaders])

  const d2TotalPages = getTotalPages(d2AllRows.length, ROWS_PER_PAGE)
  const d2StartIndex = getStartIndex(d2CurrentPage, ROWS_PER_PAGE)
  const d2PageRows = d2AllRows.slice(d2StartIndex, d2StartIndex + ROWS_PER_PAGE)

  const d2AllLabels = useMemo(() => d2AllRows.map((row) => row.label), [d2AllRows])

  useEffect(() => {
    if (d2AllLabels.length > 0) {
      const defaultLabelIndices = createSequentialIndices(Math.min(10, d2AllLabels.length))
      setD2DraftLabelIndices(defaultLabelIndices)
      setD2AppliedLabelIndices(defaultLabelIndices)
    }
  }, [d2AllLabels.length])

  const d2DisplayedRows = useMemo(() => {
    if (d2AppliedLabelIndices === null || d2AppliedLabelIndices.length === 0) {
      return d2PageRows
    }

    return d2PageRows.filter((row) => {
      const rowLabelIndex = d2AllLabels.indexOf(row.label)
      return d2AppliedLabelIndices.includes(rowLabelIndex)
    })
  }, [d2PageRows, d2AppliedLabelIndices, d2AllLabels])

  const d2ChartData = {
    labels: d2DisplayedRows.map((row) => row.label),
    datasets: (d2AppliedMetrics || []).map((header, metricIndex) => ({
      label: header,
      data: d2DisplayedRows.map((row) => row.values[metricIndex] ?? 0),
      backgroundColor: palette[metricIndex % palette.length],
      borderColor: palette[metricIndex % palette.length],
      borderWidth: 1,
    })),
  }

  const d2ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
    },
    ...(d2ChartType === 'radar'
      ? {}
      : {
          indexAxis:
            d2ChartType === 'horizontalBar' || d2ChartType === 'stackedHorizontalBar' ? 'y' : 'x',
          scales:
            d2ChartType === 'horizontalBar'
              ? { y: { ticks: { maxRotation: 0 } }, x: { beginAtZero: true } }
              : d2ChartType === 'stackedBar'
                ? {
                    x: { stacked: true, ticks: { maxRotation: 45, minRotation: 0 } },
                    y: { stacked: true, beginAtZero: true },
                  }
                : d2ChartType === 'stackedHorizontalBar'
                  ? {
                      x: { stacked: true, beginAtZero: true },
                      y: { stacked: true, ticks: { maxRotation: 0 } },
                    }
                  : { x: { ticks: { maxRotation: 45, minRotation: 0 } }, y: { beginAtZero: true } },
        }),
  }

  const handleD2ToggleMetric = (header) => {
    setD2DraftMetrics((previous) => {
      if (previous.includes(header)) {
        return previous.filter((h) => h !== header)
      }

      if (previous.length >= 4) {
        return previous
      }

      return [...previous, header]
    })
  }

  const handleD2ClearAll = () => {
    setD2DraftMetrics([])
  }

  const handleD2Apply = () => {
    if (isSelectionCountValid(d2DraftMetrics.length, 1, 4)) {
      setD2AppliedMetrics([...d2DraftMetrics])
      setD2CurrentPage(1)
      setIsD2Open(false)
    }
  }

  const isD2ApplyDisabled = !isSelectionCountValid(d2DraftMetrics.length, 1, 4)

  const handleD2ToggleLabelIndex = (labelIndex) => {
    setD2DraftLabelIndices((previous) => {
      if (previous.includes(labelIndex)) {
        return previous.filter((i) => i !== labelIndex)
      }

      if (previous.length >= 10) {
        return previous
      }

      return [...previous, labelIndex]
    })
  }

  const handleD2ClearLabelSelection = () => {
    setD2DraftLabelIndices([])
  }

  const handleD2ApplyLabelSelection = () => {
    if (isSelectionCountValid(d2DraftLabelIndices.length, 3, 10)) {
      setD2AppliedLabelIndices([...d2DraftLabelIndices])
      setIsD2CustomizeOpen(false)
    }
  }

  const isD2LabelSelectionValid = isSelectionCountValid(d2DraftLabelIndices.length, 3, 10)

  const handleD2ResetDefault = () => {
    const defaultMetrics = d2MetricHeaders.slice(0, 1)
    const defaultLabelIndices = createSequentialIndices(Math.min(10, d2AllLabels.length))
    setD2DraftMetrics(defaultMetrics)
    setD2AppliedMetrics(defaultMetrics)
    setD2DraftLabelIndices(defaultLabelIndices)
    setD2AppliedLabelIndices(defaultLabelIndices)
    setD2CurrentPage(1)
    setIsD2Open(false)
    setIsD2CustomizeOpen(false)
    setD2ChartType('bar')
  }



  return {
    state: {
      isD2Open,
      d2DraftMetrics,
      d2AppliedMetrics,
      d2CurrentPage,
      d2ChartType,
      isD2CustomizeOpen,
      d2DraftLabelIndices,
      d2AppliedLabelIndices,
    },
    handlers: {
      setIsD2Open,
      setD2DraftMetrics,
      setD2AppliedMetrics,
      setD2CurrentPage,
      setD2ChartType,
      setIsD2CustomizeOpen,
      handleD2ToggleMetric,
      handleD2ClearAll,
      handleD2Apply,
      handleD2ToggleLabelIndex,
      handleD2ClearLabelSelection,
      handleD2ApplyLabelSelection,
      handleD2ResetDefault,
    },
    data: {
      d2MetricHeaders,
      d2AllRows,
      d2TotalPages,
      d2PageRows,
      d2AllLabels,
      d2DisplayedRows,
      d2ChartData,
      d2ChartOptions,
    },
    validation: {
      isD2ApplyDisabled,
      isD2LabelSelectionValid,
    },
  }
}
