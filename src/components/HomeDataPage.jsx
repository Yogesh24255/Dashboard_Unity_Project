import { useRef, useState } from 'react'
import {
  buildDatasetFromCsvText,
  downloadDatasetAsExcel,
  isNumericValue,
  getCachedDataset,
  setCachedDataset,
} from '../utils/csvDataUtils'
import defaultCsvText from '../files/DataCsvFile.csv?raw'

function HomeDataPage({
  fileName,
  csvHeaders,
  csvRows,
  csvError,
  onDataLoaded,
  onError,
  onClear,
  onContinue,
}) {
  const fileInputRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)

  const processCsvText = (text, sourceFileName) => {
    const dataset = buildDatasetFromCsvText(text)

    if (dataset.error) {
      onError(dataset.error)
      return
    }

    onDataLoaded({
      fileName: sourceFileName,
      headers: dataset.headers,
      rows: dataset.rows,
    })
  }

  const handleUseExistingData = () => {
    if (isLoading) {
      return
    }

    setIsLoading(true)
    window.setTimeout(() => {
      try {
        const cached = getCachedDataset()
        if (cached) {
          onDataLoaded({
            fileName: 'DataCsvFile.csv',
            headers: cached.headers,
            rows: cached.rows,
          })
          return
        }

        const dataset = buildDatasetFromCsvText(defaultCsvText)

        if (dataset.error) {
          onError(dataset.error)
          return
        }

        setCachedDataset(dataset.headers, dataset.rows)

        onDataLoaded({
          fileName: 'DataCsvFile.csv',
          headers: dataset.headers,
          rows: dataset.rows,
        })
      } finally {
        setIsLoading(false)
      }
    }, 0)
  }

  const handleChooseUpload = () => {
    if (isLoading) {
      return
    }

    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleUpload = (event) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      onError('Please upload a valid CSV file.')
      event.target.value = ''
      return
    }

    setIsLoading(true)

    const reader = new FileReader()

    reader.onload = () => {
      try {
        const fileText = typeof reader.result === 'string' ? reader.result : ''
        processCsvText(fileText, selectedFile.name)
        event.target.value = ''
      } finally {
        setIsLoading(false)
      }
    }

    reader.onerror = () => {
      try {
        onError('Could not read the selected file. Try again.')
        event.target.value = ''
      } finally {
        setIsLoading(false)
      }
    }

    reader.readAsText(selectedFile)
  }

  const hasData = csvHeaders.length > 0
  const summaryStats = [
    {
      label: 'Status',
      value: hasData ? 'Dataset ready' : 'Awaiting data',
    },
    {
      label: 'Rows',
      value: hasData ? csvRows.length : '—',
    },
    {
      label: 'Columns',
      value: hasData ? csvHeaders.length : '—',
    },
  ]

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClear()
  }

  return (
    <main className="app-page">
      <header className="app-page__header">
        <div>
          <span className="app-page__eyebrow">Data intelligence workspace</span>
          <h1>Insight Command Center</h1>
          <p className="app-page__lead">
            Upload or reuse a CSV dataset, preview the data instantly, and launch polished
            dashboards with a cleaner analytics experience.
          </p>
        </div>

        <div className="app-page__stats" aria-label="Dataset summary">
          {summaryStats.map((stat) => (
            <div key={stat.label} className="app-page__stat">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </header>

      <section className="page-content">
        <article className="panel panel--home">
          {isLoading && (
            <div className="home-loader-overlay" role="status" aria-live="polite">
              <div className="home-loader-overlay__spinner" aria-hidden="true" />
              <p>Processing data, please wait...</p>
            </div>
          )}
          <h2>Choose Data Source</h2>
          <p>Pick existing repository data or upload a new CSV file before opening dashboards.</p>

          <div className="home-actions">
            <button
              type="button"
              className="home-actions__primary"
              onClick={handleUseExistingData}
              disabled={isLoading}
            >
              Use Existing Data
            </button>

            <button
              type="button"
              className="home-actions__secondary"
              onClick={handleChooseUpload}
              disabled={isLoading}
            >
              Upload New Data
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="csv-upload__input"
              accept=".csv"
              onChange={handleUpload}
            />

            <button
              type="button"
              className="csv-upload__download"
              onClick={() => downloadDatasetAsExcel(csvHeaders, csvRows, fileName)}
              disabled={isLoading || !hasData}
            >
              Download Excel
            </button>

            <button
              type="button"
              className="home-actions__clear"
              onClick={handleClear}
              disabled={isLoading || (!hasData && !csvError)}
            >
              Clear Data
            </button>
          </div>

          <div className="home-actions__footer">
            <div className="home-actions__footer-row">
              <button
                type="button"
                className={`home-actions__continue ${!hasData ? 'home-actions__continue--spaced' : ''}`}
                onClick={onContinue}
                disabled={isLoading || !hasData}
              >
                Continue to Dashboards
              </button>

              {fileName && <p className="home-meta">Loaded source: {fileName}</p>}
            </div>

            {csvError && <p className="csv-upload__error">{csvError}</p>}
          </div>

          {hasData && (
            <div className="table-wrapper">
              <div className="table-meta">
                <span>Rows: {csvRows.length}</span>
                <span>Columns: {csvHeaders.length}</span>
              </div>

              <table className="csv-table">
                <thead>
                  <tr>
                    <th className="csv-table__index" aria-label="Row number">
                      #
                    </th>
                    {csvHeaders.map((header, index) => (
                      <th
                        key={`${header}-${index}`}
                        className={index === 0 ? 'csv-table__name' : ''}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`}>
                      <th className="csv-table__index" scope="row">
                        {rowIndex + 1}
                      </th>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`cell-${rowIndex}-${cellIndex}`}
                          className={
                            cellIndex === 0
                              ? 'csv-table__name'
                              : isNumericValue(cell)
                                ? 'is-number'
                                : ''
                          }
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </main>
  )
}

export default HomeDataPage
