import { useEffect, useState } from 'react'

export function TableModeOptionsModal({ isOpen, onClose, onApply }) {
  const [selectedOption, setSelectedOption] = useState('default')

  useEffect(() => {
    if (isOpen) {
      setSelectedOption('default')
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Load Table Data</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">Choose how to load table metrics:</p>

          <div className="radio-options-list">
            <label className="radio-option">
              <input
                type="radio"
                name="table-load-option"
                value="default"
                checked={selectedOption === 'default'}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <div>
                <span>Load default table</span>
                <small>Show all default metrics as loaded on dashboard start.</small>
              </div>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="table-load-option"
                value="previous"
                checked={selectedOption === 'previous'}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <div>
                <span>Load previous table content</span>
                <small>Restore your table metric selection before chart mode.</small>
              </div>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="table-load-option"
                value="current"
                checked={selectedOption === 'current'}
                onChange={(e) => setSelectedOption(e.target.value)}
              />
              <div>
                <span>Load current selected metric data</span>
                <small>Use currently selected chart metrics in table.</small>
              </div>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="modal-button modal-button--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="modal-button modal-button--primary"
            onClick={() => onApply(selectedOption)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
