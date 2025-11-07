import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useSelector((state) => state.auth)

  if (!token || !user) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/driver/login'} replace />
  }

  if (user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/driver/dashboard'} replace />
  }

  return children
}

export default ProtectedRoute

