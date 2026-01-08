import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import HotelDetail from './pages/HotelDetail'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hotel/:id" element={<HotelDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
