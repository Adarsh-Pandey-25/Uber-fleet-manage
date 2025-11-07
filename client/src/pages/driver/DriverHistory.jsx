import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLogs, updateLog, deleteLog } from '../../store/slices/logSlice'
import Layout from '../../components/Layout'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'react-toastify'

const DriverHistory = () => {
  const dispatch = useDispatch()
  const { logs, loading } = useSelector((state) => state.logs)
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  })
  const [editingLog, setEditingLog] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  useEffect(() => {
    loadLogs()
  }, [dateRange])

  const loadLogs = async () => {
    try {
      const params = {}
      if (dateRange.startDate) {
        params.startDate = dateRange.startDate.toISOString().split('T')[0]
      }
      if (dateRange.endDate) {
        params.endDate = dateRange.endDate.toISOString().split('T')[0]
      }
      await dispatch(fetchLogs(params)).unwrap()
    } catch (error) {
      toast.error(error)
    }
  }

  const handleEdit = (log) => {
    setEditingLog(log._id)
    setEditFormData({
      totalKm: log.totalKm.toString(),
      fuelCost: log.fuelCost.toString(),
      otherExpenses: log.otherExpenses.toString(),
      cashCollected: log.cashCollected.toString(),
      onlineCollected: log.onlineCollected.toString(),
    })
  }

  const handleUpdate = async (logId) => {
    try {
      await dispatch(updateLog({
        id: logId,
        data: {
          totalKm: parseFloat(editFormData.totalKm),
          fuelCost: parseFloat(editFormData.fuelCost),
          otherExpenses: parseFloat(editFormData.otherExpenses) || 0,
          cashCollected: parseFloat(editFormData.cashCollected),
          onlineCollected: parseFloat(editFormData.onlineCollected),
        },
      })).unwrap()
      toast.success('Log updated successfully!')
      setEditingLog(null)
      loadLogs()
    } catch (error) {
      toast.error(error)
    }
  }

  const handleDelete = async (logId) => {
    if (window.confirm('Are you sure you want to delete this log entry?')) {
      try {
        await dispatch(deleteLog(logId)).unwrap()
        toast.success('Log deleted successfully!')
        loadLogs()
      } catch (error) {
        toast.error(error)
      }
    }
  }

  return (
    <Layout role="driver">
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Daily Log History</h1>

        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <DatePicker
                selected={dateRange.startDate}
                onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select start date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <DatePicker
                selected={dateRange.endDate}
                onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select end date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          {(dateRange.startDate || dateRange.endDate) && (
            <button
              onClick={() => setDateRange({ startDate: null, endDate: null })}
              className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
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
                  <tr key={log._id}>
                    {editingLog === log._id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editFormData.totalKm}
                            onChange={(e) => setEditFormData({ ...editFormData, totalKm: e.target.value })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editFormData.fuelCost}
                            onChange={(e) => setEditFormData({ ...editFormData, fuelCost: e.target.value })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editFormData.otherExpenses}
                            onChange={(e) => setEditFormData({ ...editFormData, otherExpenses: e.target.value })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editFormData.cashCollected}
                            onChange={(e) => setEditFormData({ ...editFormData, cashCollected: e.target.value })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editFormData.onlineCollected}
                            onChange={(e) => setEditFormData({ ...editFormData, onlineCollected: e.target.value })}
                            className="w-20 px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{(
                            (parseFloat(editFormData.cashCollected) || 0) +
                            (parseFloat(editFormData.onlineCollected) || 0) -
                            (parseFloat(editFormData.fuelCost) || 0) -
                            (parseFloat(editFormData.otherExpenses) || 0)
                          ).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUpdate(log._id)}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingLog(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.date).toLocaleDateString()}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(log)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(log._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

export default DriverHistory

