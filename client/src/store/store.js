import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import driverReducer from './slices/driverSlice'
import logReducer from './slices/logSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    drivers: driverReducer,
    logs: logReducer,
  },
})

