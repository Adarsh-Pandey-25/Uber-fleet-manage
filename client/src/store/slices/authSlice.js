import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Set auth token in axios headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('token', token)
  } else {
    delete axios.defaults.headers.common['Authorization']
    localStorage.removeItem('token')
  }
}

// Load token from localStorage on app start
const token = localStorage.getItem('token')
if (token) {
  setAuthToken(token)
}

// Admin Login
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/admin/login`, {
        email,
        password,
      })
      setAuthToken(response.data.token)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      )
    }
  }
)

// Driver Login (using phone number)
export const driverLogin = createAsyncThunk(
  'auth/driverLogin',
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/driver/login`, {
        phone,
        password,
      })
      setAuthToken(response.data.token)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      )
    }
  }
)

// Register Admin (one-time setup)
export const registerAdmin = createAsyncThunk(
  'auth/registerAdmin',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/admin/register`, {
        email,
        password,
        name,
      })
      setAuthToken(response.data.token)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      )
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: token ? JSON.parse(localStorage.getItem('user') || 'null') : null,
    token: token || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      setAuthToken(null)
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Driver Login
      .addCase(driverLogin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(driverLogin.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(driverLogin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Register Admin
      .addCase(registerAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer

