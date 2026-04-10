import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { useDashboardMetricsFilter } from '../hooks/useDashboardMetricsFilter'
import { isSerialLikeHeader, palette } from '../utils/chartUtils'
import {
  ROWS_PER_PAGE,
  aggregateRowsByFirstColumn,
  getStartIndex,
  getTotalPages,
  parseNumericValue,
} from '../utils/dashboardCommon'
import { MetricsFilter } from './MetricsFilter'
import { ChartMetricsModal } from './ChartMetricsModal'
import { TableModeOptionsModal } from './TableModeOptionsModal'

export function DynamicDashboardView({ csvHeaders, csvRows }) {
  const metricsFilter = useDashboardMetricsFilter(csvHeaders, csvRows)
  const [currentPage, setCurrentPage] = useState(1)
  const [showChart, setShowChart] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTableModeModalOpen, setIsTableModeModalOpen] = useState(false)
  const [chartMetrics, setChartMetrics] = useState([])
  const [previousTableMetrics, setPreviousTableMetrics] = useState([])

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

  const totalPages = getTotalPages(aggregatedRows.length, ROWS_PER_PAGE)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [appliedMetricHeaders.length])

  const pageStart = getStartIndex(currentPage, ROWS_PER_PAGE)
  const pageRows = aggregatedRows.slice(pageStart, pageStart + ROWS_PER_PAGE)

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

    const chartLabels = pageRows.map((row) => row[0] || 'Unknown')

    const datasets = chartMetrics.map((metric, index) => {
      const metricIndex = csvHeaders.indexOf(metric)
      if (metricIndex === -1) return null

      return {
        label: metric,
        data: pageRows.map((row) => parseNumericValue(row[metricIndex], 0)),
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
                {pageRows.map((row, rowIndex) => {
                  const absoluteIndex = pageStart + rowIndex
                  return (
                    <tr key={`dynamic-row-${absoluteIndex}`}>
                      <th className="csv-table__index" scope="row">
                        {absoluteIndex + 1}
                      </th>
                      {tableColumns.map((column) => {
                        const value = row[column.index] ?? ''
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
