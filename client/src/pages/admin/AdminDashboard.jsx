import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats } from '../../store/slices/logSlice'
import Layout from '../../components/Layout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'react-toastify'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { dashboardStats } = useSelector((state) => state.logs)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    loadStats()
  }, [dateRange])

  const loadStats = async () => {
    try {
      await dispatch(fetchDashboardStats({
        role: 'admin',
        params: dateRange.startDate || dateRange.endDate ? dateRange : {},
      })).unwrap()
    } catch (error) {
      toast.error(error)
    }
  }

  const chartData = dashboardStats ? [
    { name: 'Cash', value: dashboardStats.totalCashCollected },
    { name: 'Online', value: dashboardStats.totalOnlineCollected },
  ] : []

  const COLORS = ['#0088FE', '#00C49F']

  return (
    <Layout role="admin">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="mt-4 flex gap-4">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {dashboardStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total Drivers</h3>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalDrivers}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total KM Driven</h3>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalKm.toFixed(2)} km</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total Expenses</h3>
                <p className="text-3xl font-bold text-red-600">₹{dashboardStats.totalExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Cash Collected</h3>
                <p className="text-3xl font-bold text-green-600">₹{dashboardStats.totalCashCollected.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Online Collected</h3>
                <p className="text-3xl font-bold text-blue-600">₹{dashboardStats.totalOnlineCollected.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-600 text-sm font-medium mb-2">Total Earnings</h3>
                <p className="text-3xl font-bold text-purple-600">₹{dashboardStats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Collection Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
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
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default AdminDashboard

