import { useEffect, useState } from 'react'

export function ChartMetricsModal({
  isOpen,
  allMetrics,
  selectedTableMetrics,
  onClose,
  onApply,
}) {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedMetrics, setSelectedMetrics] = useState([])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const defaultTab = selectedTableMetrics.length > 0 ? 'selected' : 'all'
    setActiveTab(defaultTab)
    setSelectedMetrics([])
  }, [isOpen, selectedTableMetrics])

  const visibleMetrics = activeTab === 'selected' ? selectedTableMetrics : allMetrics

  if (!isOpen) return null

  const handleToggleMetric = (metric) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(metric)) {
        return prev.filter((m) => m !== metric)
      }

      // Max 4 metrics
      if (prev.length < 4) {
        return [...prev, metric]
      }

      return prev
    })
  }

  const handleApply = () => {
    if (selectedMetrics.length > 0) {
      onApply(selectedMetrics)
      setSelectedMetrics([])
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedMetrics((prev) => prev.filter((metric) => (tab === 'selected' ? selectedTableMetrics : allMetrics).includes(metric)))
  }

  const handleCancel = () => {
    setSelectedMetrics([])
    onClose()
  }

  const isApplyDisabled = selectedMetrics.length === 0

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Select Metrics for Chart</h3>
          <button type="button" className="modal-close" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Select between 1 and 4 metrics to display on the chart.
          </p>
          <div className="modal-tabs" role="tablist" aria-label="Metric source tabs">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              className={`modal-tab ${activeTab === 'all' ? 'modal-tab--active' : ''}`}
              onClick={() => handleTabChange('all')}
            >
              All Metrics
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'selected'}
              className={`modal-tab ${activeTab === 'selected' ? 'modal-tab--active' : ''}`}
              onClick={() => handleTabChange('selected')}
            >
              Selected Table Metrics
            </button>
          </div>
          <div className="metrics-list">
            {visibleMetrics.length ? (
              visibleMetrics.map((metric, index) => (
                <label key={`${metric}-${index}`} className="metric-option">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric)}
                    onChange={() => handleToggleMetric(metric)}
                    disabled={
                      !selectedMetrics.includes(metric) && selectedMetrics.length >= 4
                    }
                  />
                  <span>{metric}</span>
                </label>
              ))
            ) : (
              <div className="modal-empty-state">
                No table-selected metrics available. Switch to All Metrics.
              </div>
            )}
          </div>
          <div className="selected-count">
            Selected: {selectedMetrics.length}/4
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-button modal-button--secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal-button modal-button--primary"
            onClick={handleApply}
            disabled={isApplyDisabled}
          >
            Apply & Generate Chart
          </button>
        </div>
      </div>
    </div>
  )
}
