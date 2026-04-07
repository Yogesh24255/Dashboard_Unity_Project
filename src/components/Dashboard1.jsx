import { useRef } from 'react'
import { Bar, Doughnut, Line, Pie, PolarArea } from 'react-chartjs-2'
import { palette } from '../utils/chartUtils'
import { useClickOutside } from '../hooks/useClickOutside'

export function Dashboard1({
  usableHeaders,
  selectedCategoryHeader,
  selectedMetricHeader,
  metricHeaderOptions,
  setSelectedMetricHeader,
  chartType,
  setChartType,
  isCustomizeOpen,
  setIsCustomizeOpen,
  dashboardOneRows,
  draftSelectedIndices,
  handleToggleDraftRow,
  handleClearSelection,
  isDraftSelectionValid,
  handleApplySelection,
  handleResetToDefault,
  displayedRows,
  chartLabels,
  chartValues,
  currentPage,
  setCurrentPage,
  totalPages,
  appliedSelectedIndices,
}) {
  const customizeRef = useClickOutside(() => setIsCustomizeOpen(false))

  const renderChart = () => {
    const chartData = {
      labels: chartLabels,
      datasets: [
        {
          label: selectedMetricHeader || 'Metric',
          data: chartValues,
          borderColor: '#2563eb',
          backgroundColor: chartLabels.map((_, index) => palette[index % palette.length]),
          borderWidth: 2,
        },
      ],
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType !== 'bar' && chartType !== 'line' && chartType !== 'horizontalBar',
        },
      },
      scales:
        chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea'
          ? undefined
          : {
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 0,
                },
              },
              y: {
                beginAtZero: true,
              },
            },
      indexAxis: chartType === 'horizontalBar' ? 'y' : 'x',
    }

    if (chartType === 'line') {
      return <Line data={chartData} options={chartOptions} />
    }

    if (chartType === 'pie') {
      return <Pie data={chartData} options={chartOptions} />
    }

    if (chartType === 'doughnut') {
      return <Doughnut data={chartData} options={chartOptions} />
    }

    if (chartType === 'polarArea') {
      return <PolarArea data={chartData} options={chartOptions} />
    }

    return <Bar data={chartData} options={chartOptions} />
  }

  return (
    <>
      <h2>Dashboard 1</h2>
      <p>
        This view auto-picks the first two usable headers (excluding serial/index fields). Keep
        label column fixed and switch metric column as needed.
      </p>

      {usableHeaders.length < 2 ? (
        <p className="dashboard-warning">At least two non-serial columns are required for charting.</p>
      ) : (
        <>
          <div className="chart-controls">
            <label className="chart-control-card" htmlFor="metricHeader">
              <span className="chart-control-card__label">Metric Column</span>
              <select
                id="metricHeader"
                className="chart-control-card__select"
                value={selectedMetricHeader}
                onChange={(event) => setSelectedMetricHeader(event.target.value)}
              >
                {metricHeaderOptions.map((header, headerIndex) => (
                  <option key={`${header}-${headerIndex}`} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </label>

            <label className="chart-control-card" htmlFor="chartType">
              <span className="chart-control-card__label">Chart Type</span>
              <select
                id="chartType"
                className="chart-control-card__select"
                value={chartType}
                onChange={(event) => setChartType(event.target.value)}
              >
                <option value="bar">Bar (Default)</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
                <option value="doughnut">Doughnut</option>
                <option value="polarArea">Polar Area</option>
                <option value="horizontalBar">Horizontal Bar</option>
              </select>
            </label>
          </div>

          <div className="chart-top-actions">
            <div className="customize-selector" ref={customizeRef}>
              <button
                type="button"
                className="customize-selector__toggle"
                onClick={() => setIsCustomizeOpen((value) => !value)}
              >
                Customize
              </button>

              {isCustomizeOpen && (
                <div className="customize-selector__dropdown">
                  <div className="customize-selector__list">
                    {dashboardOneRows.map((row, rowIndex) => (
                      <label key={`${row.label}-${rowIndex}`} className="customize-selector__item">
                        <input
                          type="checkbox"
                          checked={draftSelectedIndices.includes(rowIndex)}
                          onChange={() => handleToggleDraftRow(rowIndex)}
                          disabled={
                            !draftSelectedIndices.includes(rowIndex) && draftSelectedIndices.length >= 10
                          }
                        />
                        <span>{row.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="customize-selector__footer">
                    <button
                      type="button"
                      className="customize-selector__clear"
                      onClick={handleClearSelection}
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      className="customize-selector__apply"
                      onClick={handleApplySelection}
                      disabled={!isDraftSelectionValid}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button type="button" className="chart-reset-top" onClick={handleResetToDefault}>
              Reset Default
            </button>
          </div>

          <div className="chart-frame">{renderChart()}</div>

          <div className="chart-pagination">
            <button
              type="button"
              onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1 || appliedSelectedIndices !== null}
            >
              ← Previous
            </button>
            <span>
              Page {currentPage} of {appliedSelectedIndices === null ? totalPages : 1}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages || appliedSelectedIndices !== null}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </>
  )
}
