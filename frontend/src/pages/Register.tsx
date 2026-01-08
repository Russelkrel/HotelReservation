import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !name) {
      setError('All fields are required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    try {
      register(email, password, name)
      navigate('/')
    } catch (err) {
      setError('Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-100">Create Account</h1>
        
        {error && <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Register
          </button>
        </form>
        
        <p className="text-center mt-4 text-gray-600">
          Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  )
}
