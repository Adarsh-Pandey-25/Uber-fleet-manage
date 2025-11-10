import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { createLog, updateLog, fetchLogs } from '../../store/slices/logSlice'
import Layout from '../../components/Layout'
import { toast } from 'react-toastify'

const DriverDailyReport = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [formData, setFormData] = useState({
    totalKm: '',
    fuelCost: '',
    otherExpenses: '',
    cashCollected: '',
    onlineCollected: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expenseBill, setExpenseBill] = useState(null)
  const [existingBillUrl, setExistingBillUrl] = useState(null)

  const getImageUrl = (expenseBillPath) => {
    if (!expenseBillPath) return null
    if (expenseBillPath.startsWith('http')) return expenseBillPath
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const baseUrl = API_URL.replace('/api', '')
    return `${baseUrl}${expenseBillPath}`
  }

  useEffect(() => {
    checkExistingLog()
  }, [selectedDate])

  const checkExistingLog = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await dispatch(fetchLogs({
        startDate: dateStr,
        endDate: dateStr,
        limit: 1,
      })).unwrap()

      if (response.logs && response.logs.length > 0) {
        const log = response.logs[0]
        setFormData({
          totalKm: log.totalKm.toString(),
          fuelCost: log.fuelCost.toString(),
          otherExpenses: log.otherExpenses.toString(),
          cashCollected: log.cashCollected.toString(),
          onlineCollected: log.onlineCollected.toString(),
        })
        setExistingBillUrl(log.expenseBill || null)
        setIsEditing(true)
      } else {
        resetForm()
        setExistingBillUrl(null)
        setIsEditing(false)
      }
    } catch (error) {
      // No existing log found, continue with new form
      resetForm()
      setIsEditing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      totalKm: '',
      fuelCost: '',
      otherExpenses: '',
      cashCollected: '',
      onlineCollected: '',
    })
    setExpenseBill(null)
    setExistingBillUrl(null)
  }

  const calculateTotal = () => {
    const cash = parseFloat(formData.cashCollected) || 0
    const online = parseFloat(formData.onlineCollected) || 0
    const fuel = parseFloat(formData.fuelCost) || 0
    const other = parseFloat(formData.otherExpenses) || 0
    return (cash + online) - (fuel + other)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setExpenseBill(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check if file is required (for new entries or if updating without existing file)
    if (!isEditing && !expenseBill) {
      toast.error('Please upload an expense bill')
      return
    }
    
    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('date', selectedDate.toISOString())
      formDataToSend.append('totalKm', parseFloat(formData.totalKm))
      formDataToSend.append('fuelCost', parseFloat(formData.fuelCost))
      formDataToSend.append('otherExpenses', parseFloat(formData.otherExpenses) || 0)
      formDataToSend.append('cashCollected', parseFloat(formData.cashCollected))
      formDataToSend.append('onlineCollected', parseFloat(formData.onlineCollected))
      
      if (expenseBill) {
        formDataToSend.append('expenseBill', expenseBill)
      }

      if (isEditing) {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const response = await dispatch(fetchLogs({
          startDate: dateStr,
          endDate: dateStr,
          limit: 1,
        })).unwrap()
        if (response.logs && response.logs.length > 0) {
          await dispatch(updateLog({ id: response.logs[0]._id, data: formDataToSend })).unwrap()
          toast.success('Log updated successfully!')
          setExpenseBill(null)
        }
      } else {
        await dispatch(createLog(formDataToSend)).unwrap()
        toast.success('Log created successfully!')
        setIsEditing(true)
        setExpenseBill(null)
      }
    } catch (error) {
      toast.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout role="driver">
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Daily Report</h1>

        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total KM
              </label>
              <input
                type="number"
                name="totalKm"
                value={formData.totalKm}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Cost (₹)
              </label>
              <input
                type="number"
                name="fuelCost"
                value={formData.fuelCost}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Expenses (₹)
              </label>
              <input
                type="number"
                name="otherExpenses"
                value={formData.otherExpenses}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cash Collected (₹)
              </label>
              <input
                type="number"
                name="cashCollected"
                value={formData.cashCollected}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Online Collected (₹)
              </label>
              <input
                type="number"
                name="onlineCollected"
                value={formData.onlineCollected}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Bill <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="expenseBill"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                required={!isEditing || !existingBillUrl}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: JPEG, JPG, PNG, PDF (Max 5MB)
              </p>
              {existingBillUrl && !expenseBill && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Current bill:</p>
                  <a
                    href={getImageUrl(existingBillUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View current bill
                  </a>
                </div>
              )}
              {expenseBill && (
                <p className="text-sm text-green-600 mt-1">New file selected: {expenseBill.name}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Daily Total:</span>
                <span className={`text-2xl font-bold ${calculateTotal() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{calculateTotal().toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                (Cash + Online) - (Fuel + Other Expenses)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Report' : 'Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default DriverDailyReport

