import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Get all drivers
export const fetchDrivers = createAsyncThunk(
  'drivers/fetchDrivers',
  async ({ search = '', sortBy = 'createdAt', sortOrder = 'desc' } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/drivers`, {
        params: { search, sortBy, sortOrder },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch drivers')
    }
  }
)

// Get single driver
export const fetchDriver = createAsyncThunk(
  'drivers/fetchDriver',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/drivers/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch driver')
    }
  }
)

// Create driver
export const createDriver = createAsyncThunk(
  'drivers/createDriver',
  async (driverData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/drivers`, driverData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create driver')
    }
  }
)

// Update driver
export const updateDriver = createAsyncThunk(
  'drivers/updateDriver',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/drivers/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update driver')
    }
  }
)

// Delete driver
export const deleteDriver = createAsyncThunk(
  'drivers/deleteDriver',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/drivers/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete driver')
    }
  }
)

const driverSlice = createSlice({
  name: 'drivers',
  initialState: {
    drivers: [],
    currentDriver: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentDriver: (state) => {
      state.currentDriver = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch drivers
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false
        state.drivers = action.payload
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch single driver
      .addCase(fetchDriver.fulfilled, (state, action) => {
        state.currentDriver = action.payload
      })
      // Create driver
      .addCase(createDriver.fulfilled, (state, action) => {
        state.drivers.push(action.payload)
      })
      // Update driver
      .addCase(updateDriver.fulfilled, (state, action) => {
        const index = state.drivers.findIndex(d => d._id === action.payload._id)
        if (index !== -1) {
          state.drivers[index] = action.payload
        }
        if (state.currentDriver?._id === action.payload._id) {
          state.currentDriver = action.payload
        }
      })
      // Delete driver
      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.drivers = state.drivers.filter(d => d._id !== action.payload)
      })
  },
})

export const { clearError, clearCurrentDriver } = driverSlice.actions
export default driverSlice.reducer

