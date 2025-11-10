import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { logout } from '../store/slices/authSlice'

const Layout = ({ children, role }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate(role === 'admin' ? '/admin/login' : '/driver/login')
  }

  const navItems = role === 'admin' 
    ? [
        { path: '/admin/dashboard', label: 'Dashboard' },
        { path: '/admin/drivers', label: 'Drivers' },
        { path: '/admin/monitoring', label: 'Monitoring' },
      ]
    : [
        { path: '/driver/dashboard', label: 'Dashboard' },
        { path: '/driver/report', label: 'Daily Report' },
        { path: '/driver/history', label: 'History' },
      ]

  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Uber Fleet</h1>
            </div>
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="border-transparent text-gray-600 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="hidden sm:flex items-center">
              <span className="text-gray-700 mr-4 max-w-[12rem] truncate">{user?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
            <button
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{user?.name || user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-left text-gray-700 hover:bg-gray-50 px-2 py-2 rounded-md text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default Layout

