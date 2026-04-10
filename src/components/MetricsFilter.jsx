import { useRef } from 'react'
import { useClickOutside } from '../hooks/useClickOutside'

export function MetricsFilter({
  isOpen,
  setIsOpen,
  availableMetrics,
  draftSelectedMetrics,
  handleToggleMetric,
  handleSelectAll,
  handleApply,
  isSelectAllChecked,
}) {
  const ref = useClickOutside(() => setIsOpen(false))

  return (
    <div className="customize-selector" ref={ref}>
      <button
        type="button"
        className="customize-selector__toggle"
        onClick={() => setIsOpen((v) => !v)}
      >
        Metrics{draftSelectedMetrics.length > 0 ? ` (${draftSelectedMetrics.length})` : ''}
      </button>

      {isOpen && (
        <div className="customize-selector__dropdown">
          <div className="customize-selector__list">
            <label className="customize-selector__item">
              <input
                type="checkbox"
                checked={isSelectAllChecked}
                onChange={handleSelectAll}
              />
              <span style={{ fontWeight: 700 }}>Select All</span>
            </label>

            {availableMetrics.map((metric, metricIndex) => (
              <label key={`${metric}-${metricIndex}`} className="customize-selector__item">
                <input
                  type="checkbox"
                  checked={draftSelectedMetrics.includes(metric)}
                  onChange={() => handleToggleMetric(metric)}
                />
                <span>{metric}</span>
              </label>
            ))}
          </div>

          <div className="customize-selector__footer">
            <button
              type="button"
              className="customize-selector__apply"
              onClick={handleApply}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
