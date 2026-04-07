import { useRef } from 'react'
import { Bar, Line, Radar } from 'react-chartjs-2'
import { useClickOutside } from '../hooks/useClickOutside'

export function Dashboard2({
  d2MetricHeaders,
  isD2Open,
  setIsD2Open,
  d2DraftMetrics,
  handleD2ToggleMetric,
  isD2ApplyDisabled,
  handleD2ClearAll,
  handleD2Apply,
  d2ChartType,
  setD2ChartType,
  handleD2ResetDefault,
  d2AppliedMetrics,
  d2ChartData,
  d2ChartOptions,
  d2CurrentPage,
  setD2CurrentPage,
  d2TotalPages,
  isD2CustomizeOpen,
  setIsD2CustomizeOpen,
  d2AllLabels,
  d2DraftLabelIndices,
  handleD2ToggleLabelIndex,
  handleD2ClearLabelSelection,
  handleD2ApplyLabelSelection,
  isD2LabelSelectionValid,
}) {
  const d2MetricsRef = useClickOutside(() => setIsD2Open(false))
  const d2CustomizeRef = useClickOutside(() => setIsD2CustomizeOpen(false))

  return (
    <>
      <h2>Dashboard 2</h2>
      <p>Select 1–4 numeric metrics to compare on one grouped bar chart.</p>

      {!d2MetricHeaders.length ? (
        <p className="dashboard-warning">
          No numeric metric columns detected in the loaded data.
        </p>
      ) : (
        <>
          <div className="chart-top-actions">
            <div className="customize-selector" ref={d2MetricsRef}>
              <button
                type="button"
                className="customize-selector__toggle"
                onClick={() => setIsD2Open((v) => !v)}
              >
                Metrics{d2AppliedMetrics ? ` (${d2AppliedMetrics.length})` : ''}
              </button>

              {isD2Open && (
                <div className="customize-selector__dropdown">
                  <div className="customize-selector__list">
                    {d2MetricHeaders.map((header, headerIndex) => (
                      <label key={`${header}-${headerIndex}`} className="customize-selector__item">
                        <input
                          type="checkbox"
                          checked={d2DraftMetrics.includes(header)}
                          onChange={() => handleD2ToggleMetric(header)}
                          disabled={
                            !d2DraftMetrics.includes(header) && d2DraftMetrics.length >= 4
                          }
                        />
                        <span>{header}</span>
                      </label>
                    ))}
                  </div>

                  <div className="customize-selector__footer">
                    <button
                      type="button"
                      className="customize-selector__clear"
                      onClick={handleD2ClearAll}
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      className="customize-selector__apply"
                      onClick={handleD2Apply}
                      disabled={isD2ApplyDisabled}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="customize-selector" ref={d2CustomizeRef}>
              <button
                type="button"
                className="customize-selector__toggle"
                onClick={() => setIsD2CustomizeOpen((v) => !v)}
                disabled={!d2AllLabels || !d2AllLabels.length}
              >
                Customize Names
              </button>

              {isD2CustomizeOpen && d2AllLabels && d2AllLabels.length > 0 && (
                <div className="customize-selector__dropdown">
                  <div className="customize-selector__list">
                    {d2AllLabels.map((label, labelIndex) => (
                      <label key={`${label}-${labelIndex}`} className="customize-selector__item">
                        <input
                          type="checkbox"
                          checked={d2DraftLabelIndices.includes(labelIndex)}
                          onChange={() => handleD2ToggleLabelIndex(labelIndex)}
                          disabled={
                            !d2DraftLabelIndices.includes(labelIndex) &&
                            d2DraftLabelIndices.length >= 10
                          }
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="customize-selector__footer">
                    <button
                      type="button"
                      className="customize-selector__clear"
                      onClick={handleD2ClearLabelSelection}
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      className="customize-selector__apply"
                      onClick={handleD2ApplyLabelSelection}
                      disabled={!isD2LabelSelectionValid}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <select
              className="chart-type-select"
              value={d2ChartType}
              onChange={(e) => setD2ChartType(e.target.value)}
            >
              <option value="bar">Bar</option>
              <option value="horizontalBar">Horizontal Bar</option>
              <option value="stackedBar">Stacked Bar</option>
              <option value="stackedHorizontalBar">Stacked Horizontal Bar</option>
              <option value="line">Line</option>
              <option value="radar">Radar</option>
            </select>

            <button type="button" className="chart-reset-top" onClick={handleD2ResetDefault}>
              Reset Default
            </button>
          </div>

          {!d2AppliedMetrics || !d2AppliedMetrics.length ? (
            <p className="dashboard-warning">Apply at least 1 metric to render the chart.</p>
          ) : (
            <div className="chart-frame">
              {d2ChartType === 'line' ? (
                <Line data={d2ChartData} options={d2ChartOptions} />
              ) : d2ChartType === 'radar' ? (
                <Radar data={d2ChartData} options={d2ChartOptions} />
              ) : (
                <Bar data={d2ChartData} options={d2ChartOptions} />
              )}
            </div>
          )}

          <div className="chart-pagination">
            <button
              type="button"
              onClick={() => setD2CurrentPage((v) => Math.max(1, v - 1))}
              disabled={d2CurrentPage === 1}
            >
              ← Previous
            </button>
            <span>
              Page {d2CurrentPage} of {d2TotalPages}
            </span>
            <button
              type="button"
              onClick={() => setD2CurrentPage((v) => Math.min(d2TotalPages, v + 1))}
              disabled={d2CurrentPage === d2TotalPages}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </>
  )
}
