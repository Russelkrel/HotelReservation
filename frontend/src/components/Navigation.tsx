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
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-400">🚀 JOSHTEL</Link>
        
        <div className="space-x-4 flex items-center">
          {isAuthenticated ? (
            <>
              <span className="text-gray-300">Welcome, {user?.name}!</span>
              <Link to="/dashboard" className="text-gray-300 hover:text-blue-400">Dashboard</Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="text-gray-300 hover:text-yellow-400 font-bold">🔐 Admin</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-blue-400">Login</Link>
              <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
