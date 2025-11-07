import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Get logs
export const fetchLogs = createAsyncThunk(
  'logs/fetchLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/logs`, { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch logs')
    }
  }
)

// Get single log
export const fetchLog = createAsyncThunk(
  'logs/fetchLog',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/logs/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch log')
    }
  }
)

// Create log
export const createLog = createAsyncThunk(
  'logs/createLog',
  async (logData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
      const response = await axios.post(`${API_URL}/logs`, logData, config)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create log')
    }
  }
)

// Update log
export const updateLog = createAsyncThunk(
  'logs/updateLog',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
      const response = await axios.put(`${API_URL}/logs/${id}`, data, config)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update log')
    }
  }
)

// Delete log
export const deleteLog = createAsyncThunk(
  'logs/deleteLog',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/logs/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete log')
    }
  }
)

// Fetch dashboard stats
export const fetchDashboardStats = createAsyncThunk(
  'logs/fetchDashboardStats',
  async ({ role, params = {} }, { rejectWithValue }) => {
    try {
      const endpoint = role === 'admin' ? '/dashboard/admin' : '/dashboard/driver'
      const response = await axios.get(`${API_URL}${endpoint}`, { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats')
    }
  }
)

const logSlice = createSlice({
  name: 'logs',
  initialState: {
    logs: [],
    pagination: null,
    currentLog: null,
    dashboardStats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentLog: (state) => {
      state.currentLog = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch logs
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.logs
        state.pagination = action.payload.pagination
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch single log
      .addCase(fetchLog.fulfilled, (state, action) => {
        state.currentLog = action.payload
      })
      // Create log
      .addCase(createLog.fulfilled, (state, action) => {
        state.logs.unshift(action.payload)
      })
      // Update log
      .addCase(updateLog.fulfilled, (state, action) => {
        const index = state.logs.findIndex(l => l._id === action.payload._id)
        if (index !== -1) {
          state.logs[index] = action.payload
        }
        if (state.currentLog?._id === action.payload._id) {
          state.currentLog = action.payload
        }
      })
      // Delete log
      .addCase(deleteLog.fulfilled, (state, action) => {
        state.logs = state.logs.filter(l => l._id !== action.payload)
      })
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload
      })
  },
})

export const { clearError, clearCurrentLog } = logSlice.actions
export default logSlice.reducer

