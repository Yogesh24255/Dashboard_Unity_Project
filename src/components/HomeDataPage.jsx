import { useRef } from 'react'
import {
  buildDatasetFromCsvText,
  downloadDatasetAsExcel,
  isNumericValue,
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
    processCsvText(defaultCsvText, 'DataCsvFile.csv')
  }

  const handleChooseUpload = () => {
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

    const reader = new FileReader()

    reader.onload = () => {
      const fileText = typeof reader.result === 'string' ? reader.result : ''
      processCsvText(fileText, selectedFile.name)
      event.target.value = ''
    }

    reader.onerror = () => {
      onError('Could not read the selected file. Try again.')
      event.target.value = ''
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
        <article className="panel">
          <h2>Choose Data Source</h2>
          <p>Pick existing repository data or upload a new CSV file before opening dashboards.</p>

          <div className="home-actions">
            <button type="button" className="home-actions__primary" onClick={handleUseExistingData}>
              Use Existing Data
            </button>

            <button type="button" className="home-actions__secondary" onClick={handleChooseUpload}>
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
              disabled={!hasData}
            >
              Download Excel
            </button>

            <button
              type="button"
              className="home-actions__clear"
              onClick={handleClear}
              disabled={!hasData && !csvError}
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
                disabled={!hasData}
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
                      <th key={`${header}-${index}`}>{header}</th>
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
                          className={isNumericValue(cell) ? 'is-number' : ''}
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
