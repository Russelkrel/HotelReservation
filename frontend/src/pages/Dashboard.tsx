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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Profile</h2>
          <div className="space-y-3">
            <p className="text-gray-700"><span className="font-bold">Name:</span> {user?.name}</p>
            <p className="text-gray-700"><span className="font-bold">Email:</span> {user?.email}</p>
            <p className="text-gray-700"><span className="font-bold">Role:</span> {user?.role}</p>
          </div>
        </div>

        {/* Reservations */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">My Reservations</h2>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          
          {loading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : reservations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-600">
              <p>No reservations yet. <a href="/" className="text-blue-500 hover:underline">Browse hotels</a></p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map(res => (
                <div key={res.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{res.room.hotel.name}</h3>
                      <p className="text-gray-600">{res.room.type} Room (#{res.room.roomNumber})</p>
                    </div>
                    <span className={`px-4 py-2 rounded font-bold ${
                      res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                      res.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-700 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-bold">{new Date(res.checkInDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-bold">{new Date(res.checkOutDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="font-bold text-blue-600">${res.totalPrice.toFixed(2)}</p>
                    </div>
                    {res.status !== 'CANCELLED' && (
                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleCancel(res.id)}
                          className="text-red-500 hover:text-red-700 font-bold"
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
