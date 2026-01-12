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
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* User Info */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-white">Profile</h2>
          <div className="space-y-3">
            <p className="text-gray-300"><span className="font-bold text-white">Name:</span> {user?.name}</p>
            <p className="text-gray-300"><span className="font-bold text-white">Email:</span> {user?.email}</p>
            <p className="text-gray-300"><span className="font-bold text-white">Role:</span> {user?.role}</p>
          </div>
        </div>

        {/* Reservations */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">My Reservations</h2>
          {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">{error}</div>}
          
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : reservations.length === 0 ? (
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center text-gray-400 border border-gray-700">
              <p>No reservations yet. <a href="/" className="text-blue-400 hover:underline">Browse hotels</a></p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map(res => (
                <div key={res.id} className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{res.room.hotel.name}</h3>
                      <p className="text-gray-400">{res.room.type} Room (#{res.room.roomNumber})</p>
                    </div>
                    <span className={`px-4 py-2 rounded font-bold ${
                      res.status === 'CONFIRMED' ? 'bg-green-900 text-green-300' : 
                      res.status === 'CANCELLED' ? 'bg-red-900 text-red-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-300 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-bold text-white">{new Date(res.checkInDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-bold text-white">{new Date(res.checkOutDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="font-bold text-blue-400">${res.totalPrice.toFixed(2)}</p>
                    </div>
                    {res.status !== 'CANCELLED' && (
                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleCancel(res.id)}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          Cancel
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
