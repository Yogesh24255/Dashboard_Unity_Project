import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { useDashboardMetricsFilter } from '../hooks/useDashboardMetricsFilter'
import { areNumberArraysEqual, isSerialLikeHeader, palette } from '../utils/chartUtils'
import {
  ROWS_PER_PAGE,
  aggregateRowsByFirstColumn,
  createSequentialIndices,
  getStartIndex,
  getTotalPages,
  isSelectionCountValid,
  parseNumericValue,
} from '../utils/dashboardCommon'
import { MetricsFilter } from './MetricsFilter'
import { ChartMetricsModal } from './ChartMetricsModal'
import { TableModeOptionsModal } from './TableModeOptionsModal'
import { useClickOutside } from '../hooks/useClickOutside'

export function DynamicDashboardView({ csvHeaders, csvRows }) {
  const metricsFilter = useDashboardMetricsFilter(csvHeaders, csvRows)
  const [currentPage, setCurrentPage] = useState(1)
  const [showChart, setShowChart] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTableModeModalOpen, setIsTableModeModalOpen] = useState(false)
  const [chartMetrics, setChartMetrics] = useState([])
  const [previousTableMetrics, setPreviousTableMetrics] = useState([])
  const [isCustomizeNamesOpen, setIsCustomizeNamesOpen] = useState(false)
  const [draftLabelIndices, setDraftLabelIndices] = useState([])
  const [appliedLabelIndices, setAppliedLabelIndices] = useState(null)
  const customizeNamesRef = useClickOutside(() => setIsCustomizeNamesOpen(false))

  const usableHeaders = useMemo(
    () => csvHeaders.filter((header) => header && !isSerialLikeHeader(header)),
    [csvHeaders],
  )

  const labelHeader = usableHeaders[0] || ''
  const labelColumnIndex = csvHeaders.indexOf(labelHeader)
  const appliedMetricHeaders = metricsFilter.state.appliedMetrics

  // Filter to ensure only valid metrics are used
  const validAppliedMetrics = useMemo(
    () => {
      const uniqueMetrics = []

      appliedMetricHeaders.forEach((header) => {
        if (csvHeaders.includes(header) && header !== labelHeader && !uniqueMetrics.includes(header)) {
          uniqueMetrics.push(header)
        }
      })

      return uniqueMetrics
    },
    [appliedMetricHeaders, csvHeaders, labelHeader],
  )

  const aggregatedRows = useMemo(
    () => aggregateRowsByFirstColumn(csvRows, csvHeaders.length),
    [csvRows, csvHeaders.length],
  )

  const tableColumns = useMemo(() => {
    const columns = []

    if (labelHeader && labelColumnIndex >= 0) {
      columns.push({
        header: labelHeader,
        index: labelColumnIndex,
        isNameCol: true,
      })
    }

    validAppliedMetrics.forEach((header) => {
      const columnIndex = csvHeaders.indexOf(header)
      if (columnIndex >= 0) {
        columns.push({
          header,
          index: columnIndex,
          isNameCol: false,
        })
      }
    })

    return columns
  }, [validAppliedMetrics, labelHeader, labelColumnIndex, csvHeaders])

  const allRows = useMemo(
    () =>
      aggregatedRows.map((row, rowIndex) => ({
        row,
        rowIndex,
        label: row[labelColumnIndex] || `Unknown ${rowIndex + 1}`,
      })),
    [aggregatedRows, labelColumnIndex],
  )

  const allLabels = useMemo(() => allRows.map((entry) => entry.label), [allRows])
  const allLabelIndices = useMemo(
    () => createSequentialIndices(allLabels.length),
    [allLabels.length],
  )

  useEffect(() => {
    setDraftLabelIndices((previous) => {
      const filtered = previous.filter((index) => index < allLabels.length)
      return areNumberArraysEqual(previous, filtered) ? previous : filtered
    })
    setAppliedLabelIndices((previous) => {
      if (previous === null) {
        return null
      }

      const filtered = previous.filter((index) => index < allLabels.length)
      if (!filtered.length) {
        return null
      }

      return areNumberArraysEqual(previous, filtered) ? previous : filtered
    })
  }, [allLabels.length])

  const selectedRows = useMemo(() => {
    if (appliedLabelIndices === null) {
      return allRows
    }

    return appliedLabelIndices.map((index) => allRows[index]).filter(Boolean)
  }, [allRows, appliedLabelIndices])

  const totalPages = getTotalPages(selectedRows.length, ROWS_PER_PAGE)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [appliedMetricHeaders.length])

  const pageStart = getStartIndex(currentPage, ROWS_PER_PAGE)
  const pageRows = selectedRows.slice(pageStart, pageStart + ROWS_PER_PAGE)

  useEffect(() => {
    if (appliedLabelIndices === null && !isCustomizeNamesOpen) {
      setDraftLabelIndices((previous) =>
        areNumberArraysEqual(previous, allLabelIndices) ? previous : allLabelIndices,
      )
    }
  }, [allLabelIndices, appliedLabelIndices, isCustomizeNamesOpen])

  const isLabelSelectionValid = isSelectionCountValid(
    draftLabelIndices.length,
    3,
    allLabels.length,
  )
  const isAllLabelsSelected = areNumberArraysEqual(draftLabelIndices, allLabelIndices)

  const handleToggleLabelIndex = (labelIndex) => {
    setDraftLabelIndices((previous) => {
      if (previous.includes(labelIndex)) {
        return previous.filter((index) => index !== labelIndex)
      }

      return [...previous, labelIndex].sort((first, second) => first - second)
    })
  }

  const handleSelectAllLabels = () => {
    setDraftLabelIndices((previous) => {
      if (areNumberArraysEqual(previous, allLabelIndices)) {
        return []
      }

      return allLabelIndices
    })
  }

  const handleClearLabelSelection = () => {
    setDraftLabelIndices([])
  }

  const handleApplyLabelSelection = () => {
    if (!isLabelSelectionValid) {
      return
    }

    setAppliedLabelIndices([...draftLabelIndices].sort((first, second) => first - second))
    setCurrentPage(1)
    setIsCustomizeNamesOpen(false)
  }

  // Handle toggle to show chart
  const handleToggleChart = (checked) => {
    if (checked) {
      setPreviousTableMetrics([...validAppliedMetrics])
      setShowChart(true)
      // If more than 4 metrics, show modal
      if (validAppliedMetrics.length > 4) {
        setIsModalOpen(true)
      } else {
        // If 4 or fewer, use all selected metrics
        setChartMetrics(validAppliedMetrics)
      }
    } else {
      setShowChart(false)
      setIsTableModeModalOpen(true)
    }
  }

  const handleModalApply = (selectedMetrics) => {
    setChartMetrics(selectedMetrics)
    setIsModalOpen(false)
  }

  const handleTableModeApply = (selectedOption) => {
    if (selectedOption === 'default') {
      metricsFilter.handlers.handleLoadMetrics(metricsFilter.data.availableMetrics)
    } else if (selectedOption === 'previous') {
      const fallbackMetrics = previousTableMetrics.length
        ? previousTableMetrics
        : metricsFilter.data.availableMetrics
      metricsFilter.handlers.handleLoadMetrics(fallbackMetrics)
    } else {
      const fallbackMetrics = chartMetrics.length
        ? chartMetrics
        : metricsFilter.data.availableMetrics
      metricsFilter.handlers.handleLoadMetrics(fallbackMetrics)
    }

    setCurrentPage(1)
    setIsTableModeModalOpen(false)
  }

  // Generate stacked chart data (paginated)
  const chartData = useMemo(() => {
    if (chartMetrics.length === 0) {
      return null
    }

    const chartLabels = pageRows.map((entry) => entry.label)

    const datasets = chartMetrics.map((metric, index) => {
      const metricIndex = csvHeaders.indexOf(metric)
      if (metricIndex === -1) return null

      return {
        label: metric,
        data: pageRows.map((entry) => parseNumericValue(entry.row[metricIndex], 0)),
        backgroundColor: palette[index % palette.length],
        borderColor: palette[index % palette.length],
        borderWidth: 0,
      }
    }).filter(Boolean)

    return {
      labels: chartLabels,
      datasets,
    }
  }, [chartMetrics, pageRows, csvHeaders])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'x',
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            weight: 600,
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Aggregated Metrics Chart',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: labelHeader || 'Name',
          font: {
            weight: 'bold',
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
          font: {
            weight: 'bold',
          },
        },
      },
    },
  }

  return (
    <>
      <ChartMetricsModal
        isOpen={isModalOpen}
        allMetrics={metricsFilter.data.availableMetrics}
        selectedTableMetrics={validAppliedMetrics}
        onClose={() => {
          setIsModalOpen(false)
          setShowChart(false)
          setChartMetrics([])
        }}
        onApply={handleModalApply}
      />
      <TableModeOptionsModal
        isOpen={isTableModeModalOpen}
        onClose={() => {
          setIsTableModeModalOpen(false)
          setShowChart(true)
        }}
        onApply={handleTableModeApply}
      />
      <div className="dynamic-dashboard-header">
        <div className="dynamic-dashboard-header__title">
          <h2>Dynamic Dashboard</h2>
          <p>Select metrics to show aggregated table columns.</p>
        </div>
        <div className="dynamic-dashboard-header__toggle">
          <div className="customize-selector" ref={customizeNamesRef}>
            <button
              type="button"
              className="customize-selector__toggle"
              onClick={() => setIsCustomizeNamesOpen((value) => !value)}
              disabled={!allLabels.length}
            >
              Customize Names
            </button>

            {isCustomizeNamesOpen && allLabels.length > 0 && (
              <div className="customize-selector__dropdown">
                <div className="customize-selector__list">
                  <label className="customize-selector__item">
                    <input
                      type="checkbox"
                      checked={isAllLabelsSelected}
                      onChange={handleSelectAllLabels}
                    />
                    <span style={{ fontWeight: 700 }}>Select All</span>
                  </label>

                  {allLabels.map((label, labelIndex) => (
                    <label key={`${label}-${labelIndex}`} className="customize-selector__item">
                      <input
                        type="checkbox"
                        checked={draftLabelIndices.includes(labelIndex)}
                        onChange={() => handleToggleLabelIndex(labelIndex)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>

                <div className="customize-selector__footer">
                  <button
                    type="button"
                    className="customize-selector__clear"
                    onClick={handleClearLabelSelection}
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    className="customize-selector__apply"
                    onClick={handleApplyLabelSelection}
                    disabled={!isLabelSelectionValid}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <label htmlFor="chart-toggle" className="toggle-label">
            <input
              id="chart-toggle"
              type="checkbox"
              checked={showChart}
              onChange={(e) => handleToggleChart(e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-text">{showChart ? 'Generate Table' : 'Generate Chart'}</span>
          </label>
        </div>
      </div>

      {!showChart && (
        <MetricsFilter
          isOpen={metricsFilter.state.isOpen}
          setIsOpen={metricsFilter.handlers.setIsOpen}
          availableMetrics={metricsFilter.data.availableMetrics}
          draftSelectedMetrics={metricsFilter.state.draftSelectedMetrics}
          handleToggleMetric={metricsFilter.handlers.handleToggleMetric}
          handleSelectAll={metricsFilter.handlers.handleSelectAll}
          handleApply={metricsFilter.handlers.handleApply}
          isSelectAllChecked={metricsFilter.data.isSelectAllChecked}
        />
      )}

      {showChart && chartMetrics.length > 0 ? (
        <>
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className="chart-pagination chart-pagination--inline">
            <button
              type="button"
              onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="table-wrapper table-wrapper--paged">
            <table className="csv-table">
              <thead>
                <tr>
                  <th className="csv-table__index" aria-label="Row number">
                    #
                  </th>
                  {tableColumns.map((column, index) => (
                    <th
                      key={`${column.header}-${column.index}-${index}`}
                      className={index === 0 ? 'csv-table__name' : ''}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => {
                  const absoluteIndex = row.rowIndex
                  return (
                    <tr key={`dynamic-row-${absoluteIndex}`}>
                      <th className="csv-table__index" scope="row">
                        {absoluteIndex + 1}
                      </th>
                      {tableColumns.map((column) => {
                        const value = row.row[column.index] ?? ''
                        const isNameCol = column.isNameCol
                        const isNumeric = !isNameCol && Number.isFinite(parseNumericValue(value, NaN))
                        return (
                          <td
                            key={`dynamic-cell-${absoluteIndex}-${column.index}-${column.header}`}
                            className={isNameCol ? 'csv-table__name' : (isNumeric ? 'is-number' : '')}
                          >
                            {value}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="chart-pagination chart-pagination--inline">
            <button
              type="button"
              onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </>
  )
}
