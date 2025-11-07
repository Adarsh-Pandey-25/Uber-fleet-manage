import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats } from '../../store/slices/logSlice'
import Layout from '../../components/Layout'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toast } from 'react-toastify'

const DriverDashboard = () => {
  const dispatch = useDispatch()
  const { dashboardStats } = useSelector((state) => state.logs)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    try {
      await dispatch(fetchDashboardStats({
        role: 'driver',
        params: { period },
      })).unwrap()
    } catch (error) {
      toast.error(error)
    }
  }

  const chartData = dashboardStats ? [
    {
      name: 'Cash',
      value: dashboardStats.totalCashCollected,
    },
    {
      name: 'Online',
      value: dashboardStats.totalOnlineCollected,
    },
    {
      name: 'Expenses',
      value: dashboardStats.totalExpenses,
    },
    {
      name: 'Earnings',
      value: dashboardStats.totalEarnings,
    },
  ] : []

  return (
    <Layout role="driver">
      <div className="px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {dashboardStats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total KM</h3>
                <p className="text-3xl font-bold text-gray-900">{(dashboardStats.totalKm || 0).toFixed(2)} km</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Cash Collected</h3>
                <p className="text-3xl font-bold text-green-600">₹{(dashboardStats.totalCashCollected || 0).toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Online Collected</h3>
                <p className="text-3xl font-bold text-blue-600">₹{(dashboardStats.totalOnlineCollected || 0).toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total Expenses</h3>
                <p className="text-3xl font-bold text-red-600">₹{(dashboardStats.totalExpenses || 0).toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total Earnings</h3>
                <p className="text-3xl font-bold text-purple-600">₹{(dashboardStats.totalEarnings || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">Loading dashboard stats...</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default DriverDashboard

