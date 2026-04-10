import { useEffect, useMemo, useState } from 'react'
import { isSerialLikeHeader } from '../utils/chartUtils'

export function useDashboardMetricsFilter(csvHeaders, csvRows) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftSelectedMetrics, setDraftSelectedMetrics] = useState([])
  const [appliedMetrics, setAppliedMetrics] = useState([])

  const sanitizeMetrics = (metrics = []) => {
    const uniqueMetrics = []

    metrics.forEach((metric) => {
      if (availableMetrics.includes(metric) && !uniqueMetrics.includes(metric)) {
        uniqueMetrics.push(metric)
      }
    })

    return uniqueMetrics
  }

  const usableHeaders = useMemo(
    () => csvHeaders.filter((header) => header && !isSerialLikeHeader(header)),
    [csvHeaders],
  )

  const labelHeader = usableHeaders[0] || ''

  const availableMetrics = useMemo(() => {
    if (!csvRows.length || !csvHeaders.length) {
      return []
    }

    return csvHeaders.filter((header) => {
      if (
        !header ||
        isSerialLikeHeader(header) ||
        !usableHeaders.includes(header) ||
        header === labelHeader
      ) {
        return false
      }

      return true
    })
  }, [csvHeaders, csvRows, usableHeaders, labelHeader])

  useEffect(() => {
    if (availableMetrics.length > 0) {
      const metricsArray = [...availableMetrics]
      setDraftSelectedMetrics(metricsArray)
      setAppliedMetrics(metricsArray)
    }
  }, [availableMetrics])

  useEffect(() => {
    if (appliedMetrics.length > 0) {
      const validMetrics = appliedMetrics.filter((metric) => availableMetrics.includes(metric))
      if (validMetrics.length !== appliedMetrics.length) {
        setAppliedMetrics(validMetrics)
      }
    }
  }, [availableMetrics])

  const handleToggleMetric = (metric) => {
    setDraftSelectedMetrics((previous) => {
      if (previous.includes(metric)) {
        return previous.filter((m) => m !== metric)
      }

      return [...previous, metric]
    })
  }

  const handleSelectAll = () => {
    if (draftSelectedMetrics.length === availableMetrics.length) {
      setDraftSelectedMetrics([])
    } else {
      setDraftSelectedMetrics([...availableMetrics])
    }
  }

  const handleApply = () => {
    const validMetrics = sanitizeMetrics(draftSelectedMetrics)
    setAppliedMetrics([...validMetrics])
    setIsOpen(false)
  }

  const handleLoadMetrics = (metrics = []) => {
    const validMetrics = sanitizeMetrics(metrics)
    setDraftSelectedMetrics([...validMetrics])
    setAppliedMetrics([...validMetrics])
    setIsOpen(false)
  }

  const isSelectAllChecked = draftSelectedMetrics.length === availableMetrics.length

  return {
    state: {
      isOpen,
      draftSelectedMetrics,
      appliedMetrics,
    },
    handlers: {
      setIsOpen,
      handleToggleMetric,
      handleSelectAll,
      handleApply,
      handleLoadMetrics,
    },
    data: {
      availableMetrics,
      isSelectAllChecked,
    },
  }
}
