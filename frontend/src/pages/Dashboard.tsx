import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { reservationAPI } from '../api'

interface Reservation {
  id: number
  roomId: number
  checkInDate: string
  checkOutDate: string
  totalPrice: number
  status: string
  room: {
    roomNumber: string
    type: string
    hotel: {
      name: string
    }
  }
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true)
        const response = await reservationAPI.getUserReservations()
        setReservations(response.data)
      } catch (err: any) {
        setError('Failed to fetch reservations')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  const handleCancel = async (id: number) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await reservationAPI.cancelReservation(id)
        setReservations(reservations.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r))
        alert('Reservation cancelled')
      } catch (err: any) {
        alert('Failed to cancel reservation')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white animate-card-fade-in">Dashboard</h1>
          <button
            onClick={logout}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-red-800 smooth-transition font-medium"
          >
            Logout
          </button>
        </div>

        {/* User Info */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl shadow-lg p-8 mb-8 border border-gray-700 animate-card-fade-in" style={{animationDelay: '0.1s'}}>
          <h2 className="text-2xl font-bold mb-6 text-white">Profile Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-400 min-w-24">Name:</span>
              <span className="text-gray-200">{user?.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-400 min-w-24">Email:</span>
              <span className="text-gray-200">{user?.email}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-400 min-w-24">Role:</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-900 text-indigo-200">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Reservations */}
        <div className="animate-card-fade-in" style={{animationDelay: '0.2s'}}>
          <h2 className="text-2xl font-bold mb-6 text-white">My Reservations</h2>
          {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 animate-modal-in">{error}</div>}
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="space-y-4 w-full">
                <div className="h-32 bg-gray-800 rounded-lg animate-loading-shimmer"></div>
                <div className="h-32 bg-gray-800 rounded-lg animate-loading-shimmer" style={{animationDelay: '0.3s'}}></div>
                <div className="h-32 bg-gray-800 rounded-lg animate-loading-shimmer" style={{animationDelay: '0.6s'}}></div>
              </div>
            </div>
          ) : reservations.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl shadow-lg p-12 text-center border border-gray-700">
              <p className="text-gray-400 mb-4">No reservations yet.</p>
              <a href="/" className="text-indigo-400 hover:text-indigo-300 font-medium smooth-transition">Browse hotels to make your first booking</a>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((res, idx) => (
                <div 
                  key={res.id} 
                  className="card-stagger bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl shadow-lg p-6 border border-gray-700 hover:border-indigo-500 smooth-transition hover:shadow-lg hover:shadow-indigo-500/10"
                  style={{animationDelay: `${idx * 0.05}s`}}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{res.room.hotel.name}</h3>
                      <p className="text-gray-400 text-sm">{res.room.type} Room (#{res.room.roomNumber})</p>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-sm font-bold smooth-transition ${
                      res.status === 'CONFIRMED' ? 'bg-green-900 text-green-300' : 
                      res.status === 'CANCELLED' ? 'bg-red-900 text-red-300' :
                      'bg-amber-900 text-amber-300'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-300 mb-4 pb-4 border-t border-gray-700">
                    <div className="pt-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Check-in</p>
                      <p className="font-semibold text-white">{new Date(res.checkInDate).toLocaleDateString()}</p>
                    </div>
                    <div className="pt-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Check-out</p>
                      <p className="font-semibold text-white">{new Date(res.checkOutDate).toLocaleDateString()}</p>
                    </div>
                    <div className="pt-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Total Price</p>
                      <p className="font-semibold text-indigo-400">${res.totalPrice.toFixed(2)}</p>
                    </div>
                    {res.status !== 'CANCELLED' && (
                      <div className="pt-4 flex justify-end">
                        <button 
                          onClick={() => handleCancel(res.id)}
                          className="text-red-400 hover:text-red-300 font-semibold text-sm smooth-transition"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
