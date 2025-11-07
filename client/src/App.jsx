import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminLogin from './pages/admin/AdminLogin'
import AdminRegister from './pages/admin/AdminRegister'
import AdminDashboard from './pages/admin/AdminDashboard'
import DriverManagement from './pages/admin/DriverManagement'
import DriverMonitoring from './pages/admin/DriverMonitoring'
import DriverLogin from './pages/driver/DriverLogin'
import DriverDashboard from './pages/driver/DriverDashboard'
import DriverDailyReport from './pages/driver/DriverDailyReport'
import DriverHistory from './pages/driver/DriverHistory'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user } = useSelector((state) => state.auth)

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/admin/login"
        element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <AdminLogin />}
      />
      <Route
        path="/admin/gcv/register"
        element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <AdminRegister />}
      />
      <Route
        path="/driver/login"
        element={user?.role === 'driver' ? <Navigate to="/driver/dashboard" /> : <DriverLogin />}
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/drivers"
        element={
          <ProtectedRoute role="admin">
            <DriverManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/monitoring/:driverId?"
        element={
          <ProtectedRoute role="admin">
            <DriverMonitoring />
          </ProtectedRoute>
        }
      />

      {/* Driver Routes */}
      <Route
        path="/driver/dashboard"
        element={
          <ProtectedRoute role="driver">
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/report"
        element={
          <ProtectedRoute role="driver">
            <DriverDailyReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/history"
        element={
          <ProtectedRoute role="driver">
            <DriverHistory />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'driver' ? '/driver/dashboard' : '/driver/login'} />} />
    </Routes>
  )
}

export default App

