import { useState } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { useDashboard1 } from '../hooks/useDashboard1'
import { useDashboard2 } from '../hooks/useDashboard2'
import { Dashboard1 } from './Dashboard1'
import { Dashboard2 } from './Dashboard2'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
)

function DashboardView({ fileName, csvHeaders, csvRows, onBackHome }) {
  const [activeTab, setActiveTab] = useState('dashboard1')

  const dashboard1 = useDashboard1(csvHeaders, csvRows)
  const dashboard2 = useDashboard2(csvHeaders, csvRows)

  const tabs = [
    { id: 'dashboard1', label: 'Dashboard 1' },
    { id: 'dashboard2', label: 'Dashboard 2' },
  ]

  const currentPageTitle =
    activeTab === 'dashboard1' ? 'Dashboard 1 Overview' : 'Dashboard 2 Overview'
  const dashboardStats = [
    {
      label: 'Source',
      value: fileName || 'Sample dataset',
    },
    {
      label: 'Rows',
      value: csvRows.length || '—',
    },
    {
      label: 'Columns',
      value: csvHeaders.length || '—',
    },
  ]

  return (
    <main className="app-page">
      <header className="app-page__header">
        <div>
          <span className="app-page__eyebrow">Interactive analytics</span>
          <h1>Insight Command Center</h1>
          <p className="app-page__lead">
            {currentPageTitle} with responsive charts, customized metric controls, and an easier
            visual hierarchy for exploring your data.
          </p>
        </div>

        <div className="app-page__actions">
          <div className="app-page__stats" aria-label="Dashboard dataset summary">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="app-page__stat">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <button type="button" className="back-home" onClick={onBackHome}>
            Back to Home Data Setup
          </button>
        </div>
      </header>

      <nav className="tabs" aria-label="Dashboard tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tabs__button ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="page-content">
        <article className="panel panel--secondary">
          {activeTab === 'dashboard1' ? (
            <Dashboard1
              usableHeaders={dashboard1.data.usableHeaders}
              selectedCategoryHeader={dashboard1.state.selectedCategoryHeader}
              selectedMetricHeader={dashboard1.state.selectedMetricHeader}
              metricHeaderOptions={dashboard1.data.metricHeaderOptions}
              setSelectedMetricHeader={dashboard1.handlers.setSelectedMetricHeader}
              chartType={dashboard1.state.chartType}
              setChartType={dashboard1.handlers.setChartType}
              isCustomizeOpen={dashboard1.state.isCustomizeOpen}
              setIsCustomizeOpen={dashboard1.handlers.setIsCustomizeOpen}
              dashboardOneRows={dashboard1.data.dashboardOneRows}
              draftSelectedIndices={dashboard1.state.draftSelectedIndices}
              handleToggleDraftRow={dashboard1.handlers.handleToggleDraftRow}
              handleClearSelection={dashboard1.handlers.handleClearSelection}
              isDraftSelectionValid={
                dashboard1.state.draftSelectedIndices.length >= 3 &&
                dashboard1.state.draftSelectedIndices.length <= 10
              }
              handleApplySelection={dashboard1.handlers.handleApplySelection}
              handleResetToDefault={dashboard1.handlers.handleResetToDefault}
              displayedRows={dashboard1.data.displayedRows}
              chartLabels={dashboard1.data.chartLabels}
              chartValues={dashboard1.data.chartValues}
              currentPage={dashboard1.state.currentPage}
              setCurrentPage={dashboard1.handlers.setCurrentPage}
              totalPages={dashboard1.data.totalPages}
              appliedSelectedIndices={dashboard1.state.appliedSelectedIndices}
            />
          ) : (
            <Dashboard2
              d2MetricHeaders={dashboard2.data.d2MetricHeaders}
              isD2Open={dashboard2.state.isD2Open}
              setIsD2Open={dashboard2.handlers.setIsD2Open}
              d2DraftMetrics={dashboard2.state.d2DraftMetrics}
              handleD2ToggleMetric={dashboard2.handlers.handleD2ToggleMetric}
              isD2ApplyDisabled={dashboard2.validation.isD2ApplyDisabled}
              handleD2ClearAll={dashboard2.handlers.handleD2ClearAll}
              handleD2Apply={dashboard2.handlers.handleD2Apply}
              d2ChartType={dashboard2.state.d2ChartType}
              setD2ChartType={dashboard2.handlers.setD2ChartType}
              handleD2ResetDefault={dashboard2.handlers.handleD2ResetDefault}
              d2AppliedMetrics={dashboard2.state.d2AppliedMetrics}
              d2ChartData={dashboard2.data.d2ChartData}
              d2ChartOptions={dashboard2.data.d2ChartOptions}
              d2CurrentPage={dashboard2.state.d2CurrentPage}
              setD2CurrentPage={dashboard2.handlers.setD2CurrentPage}
              d2TotalPages={dashboard2.data.d2TotalPages}
              isD2CustomizeOpen={dashboard2.state.isD2CustomizeOpen}
              setIsD2CustomizeOpen={dashboard2.handlers.setIsD2CustomizeOpen}
              d2AllLabels={dashboard2.data.d2AllLabels}
              d2DraftLabelIndices={dashboard2.state.d2DraftLabelIndices}
              handleD2ToggleLabelIndex={dashboard2.handlers.handleD2ToggleLabelIndex}
              handleD2ClearLabelSelection={dashboard2.handlers.handleD2ClearLabelSelection}
              handleD2ApplyLabelSelection={dashboard2.handlers.handleD2ApplyLabelSelection}
              isD2LabelSelectionValid={dashboard2.validation.isD2LabelSelectionValid}
            />
          )}
        </article>
      </section>
    </main>
  )
}

export default DashboardView
