import { useState } from 'react'
import DashboardView from './components/DashboardView'
import HomeDataPage from './components/HomeDataPage'

function App() {
  const [isDashboardStarted, setIsDashboardStarted] = useState(false)
  const [fileName, setFileName] = useState('')
  const [csvHeaders, setCsvHeaders] = useState([])
  const [csvRows, setCsvRows] = useState([])
  const [csvError, setCsvError] = useState('')

  const handleDataLoaded = ({ fileName: loadedFileName, headers, rows }) => {
    setCsvError('')
    setFileName(loadedFileName)
    setCsvHeaders(headers)
    setCsvRows(rows)
  }

  const handleDataError = (message) => {
    setCsvError(message)
    setFileName('')
    setCsvHeaders([])
    setCsvRows([])
  }

  const handleClearData = () => {
    setCsvError('')
    setFileName('')
    setCsvHeaders([])
    setCsvRows([])
  }

  if (!isDashboardStarted) {
    return (
      <HomeDataPage
        fileName={fileName}
        csvHeaders={csvHeaders}
        csvRows={csvRows}
        csvError={csvError}
        onDataLoaded={handleDataLoaded}
        onError={handleDataError}
        onClear={handleClearData}
        onContinue={() => setIsDashboardStarted(true)}
      />
    )
  }

  return (
    <DashboardView
      fileName={fileName}
      csvHeaders={csvHeaders}
      csvRows={csvRows}
      onBackHome={() => setIsDashboardStarted(false)}
    />
  )
}

export default App
