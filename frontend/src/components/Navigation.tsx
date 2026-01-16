import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-850 shadow-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent hover:from-indigo-300 hover:to-indigo-500 smooth-transition">JOSHTEL</Link>
        
        <div className="space-x-4 flex items-center">
          {isAuthenticated ? (
            <>
              <span className="text-gray-300 text-sm">Welcome, <span className="font-semibold text-white">{user?.name}!</span></span>
              <Link to="/dashboard" className="text-gray-300 hover:text-indigo-400 smooth-transition font-medium">Dashboard</Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-amber-400 hover:text-amber-300 font-bold smooth-transition">Admin</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 smooth-transition font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-indigo-400 smooth-transition font-medium">Login</Link>
              <Link to="/register" className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-800 smooth-transition font-medium">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
