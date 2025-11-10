import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchDrivers } from '../../store/slices/driverSlice'
import { fetchLogs, fetchLog } from '../../store/slices/logSlice'
import Layout from '../../components/Layout'
import { toast } from 'react-toastify'
import axios from 'axios'

const DriverMonitoring = () => {
  const { driverId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { drivers } = useSelector((state) => state.drivers)
  const { logs, loading, currentLog } = useSelector((state) => state.logs)
  const [selectedDriverId, setSelectedDriverId] = useState(driverId || '')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })
  const [selectedLogId, setSelectedLogId] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    loadDrivers()
  }, [])

  useEffect(() => {
    if (selectedDriverId) {
      loadLogs()
    }
  }, [selectedDriverId, dateRange])

  const loadDrivers = async () => {
    try {
      await dispatch(fetchDrivers()).unwrap()
    } catch (error) {
      toast.error(error)
    }
  }

  const loadLogs = async () => {
    try {
      await dispatch(fetchLogs({
        driverId: selectedDriverId,
        ...dateRange,
      })).unwrap()
    } catch (error) {
      toast.error(error)
    }
  }

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams({
        driverId: selectedDriverId,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      })

      // Ensure we hit the backend API domain in production and include auth token
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/logs/export/${format}?${params}`, {
        responseType: 'blob',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `driver-logs.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Export failed')
    }
  }

  const handleRowClick = async (logId) => {
    try {
      setSelectedLogId(logId)
      setImageError(false)
      await dispatch(fetchLog(logId)).unwrap()
      setShowDetailModal(true)
    } catch (error) {
      toast.error('Failed to load log details')
    }
  }

  const closeModal = () => {
    setShowDetailModal(false)
    setSelectedLogId(null)
    setImageError(false)
  }

  const getImageUrl = (expenseBillPath) => {
    if (!expenseBillPath) return null
    if (expenseBillPath.startsWith('http')) return expenseBillPath
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const baseUrl = API_URL.replace('/api', '')
    return `${baseUrl}${expenseBillPath}`
  }

  return (
    <Layout role="admin">
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Driver Monitoring</h1>

        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Driver
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => {
                  setSelectedDriverId(e.target.value)
                  navigate(`/admin/monitoring/${e.target.value}`)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Drivers</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} ({driver.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          {selectedDriverId && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleExport('xlsx')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Export Excel
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Export PDF
              </button>
            </div>
          )}
        </div>

        {selectedDriverId ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total KM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fuel Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Other Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cash Collected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Online Collected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">No logs found</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr 
                      key={log._id}
                      onClick={() => handleRowClick(log._id)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.driverId?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.totalKm} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{log.fuelCost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{log.otherExpenses.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        ₹{log.cashCollected.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        ₹{log.onlineCollected.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{log.totalEarnings.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500">Please select a driver to view their logs</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && currentLog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeModal}>
            <div className="relative top-20 mx-auto p-8 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Daily Log Details - {new Date(currentLog.date).toLocaleDateString()}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Driver Information</h4>
                  <p className="text-sm text-gray-600"><span className="font-medium">Name:</span> {currentLog.driverId?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {currentLog.driverId?.email || 'N/A'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Date</h4>
                  <p className="text-sm text-gray-600">{new Date(currentLog.date).toLocaleDateString('en-GB', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Distance & Expenses</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total KM:</span>
                        <span className="font-medium">{currentLog.totalKm} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fuel Cost:</span>
                        <span className="font-medium text-red-600">₹{currentLog.fuelCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Other Expenses:</span>
                        <span className="font-medium text-red-600">₹{currentLog.otherExpenses.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-700 font-semibold">Total Expenses:</span>
                        <span className="font-bold text-red-600">₹{(currentLog.fuelCost + currentLog.otherExpenses).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-3">Collections</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cash Collected:</span>
                        <span className="font-medium text-green-600">₹{currentLog.cashCollected.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Online Collected:</span>
                        <span className="font-medium text-blue-600">₹{currentLog.onlineCollected.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-700 font-semibold">Total Collected:</span>
                        <span className="font-bold text-green-600">₹{(currentLog.cashCollected + currentLog.onlineCollected).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total Earnings:</span>
                  <span className={`text-3xl font-bold ${currentLog.totalEarnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{currentLog.totalEarnings.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  (Cash + Online) - (Fuel + Other Expenses)
                </p>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-4">Expense Bill</h4>
                {currentLog.expenseBill ? (
                  <div className="space-y-4">
                    {(() => {
                      const fileUrl = getImageUrl(currentLog.expenseBill)
                      const isPDF = fileUrl?.toLowerCase().endsWith('.pdf')
                      
                      if (isPDF) {
                        return (
                          <div className="text-center p-8 bg-gray-100 rounded-lg">
                            <div className="mb-4">
                              <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-gray-700 font-medium mb-2">PDF Document</p>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                              Open PDF in New Tab
                            </a>
                          </div>
                        )
                      }
                      
                      return !imageError ? (
                        <div className="flex justify-center">
                          <img
                            src={fileUrl}
                            alt="Expense Bill"
                            className="max-w-full h-auto max-h-96 rounded-lg shadow-md border border-gray-300"
                            onError={() => setImageError(true)}
                          />
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-gray-100 rounded-lg">
                          <p className="text-gray-500 mb-2">Image could not be loaded</p>
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Open in new tab
                          </a>
                        </div>
                      )
                    })()}
                    <div className="text-center">
                      <a
                        href={getImageUrl(currentLog.expenseBill)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Full Size / Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No expense bill uploaded</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default DriverMonitoring

