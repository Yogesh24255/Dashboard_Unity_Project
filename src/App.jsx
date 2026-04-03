import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const lineData = {
  labels,
  datasets: [
    {
      label: 'Revenue',
      data: [1200, 1900, 1500, 2200, 2800, 3200],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      tension: 0.4,
    },
  ],
}

const barData = {
  labels,
  datasets: [
    {
      label: 'Orders',
      data: [80, 120, 95, 140, 170, 210],
      backgroundColor: '#0ea5e9',
      borderRadius: 6,
    },
  ],
}

const doughnutData = {
  labels: ['Desktop', 'Mobile', 'Tablet'],
  datasets: [
    {
      label: 'Traffic Sources',
      data: [52, 38, 10],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    },
  ],
}

function App() {
  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <h1>Dashboard Unity Project</h1>
        <p>React + Vite + Chart.js + SCSS</p>
      </header>

      <section className="dashboard__grid">
        <article className="card card--wide">
          <h2>Revenue Trend</h2>
          <Line data={lineData} />
        </article>

        <article className="card">
          <h2>Monthly Orders</h2>
          <Bar data={barData} />
        </article>

        <article className="card">
          <h2>User Devices</h2>
          <Doughnut data={doughnutData} />
        </article>
      </section>
    </main>
  )
}

export default App
