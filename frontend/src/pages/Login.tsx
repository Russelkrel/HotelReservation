import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('All fields are required')
      return
    }
    try {
      setError('')
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900 flex items-center justify-center px-4 animate-fade-in">
      <div className="animate-modal-in w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl shadow-2xl shadow-indigo-900/20 p-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-center mb-2 text-white">JOSHTEL</h1>
          <p className="text-center text-gray-400 mb-8 text-sm">Welcome back to your hotel booking platform</p>
          
          {error && <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6 animate-modal-in">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus-glow disabled:bg-gray-600 disabled:border-gray-700 smooth-transition"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus-glow disabled:bg-gray-600 disabled:border-gray-700 smooth-transition"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 smooth-transition disabled:from-gray-500 disabled:to-gray-500 mt-6"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="text-center mt-6 text-gray-400 text-sm">
            Don't have an account? <a href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium smooth-transition">Create one here</a>
          </p>
        </div>
      </div>
    </div>
  )
}
