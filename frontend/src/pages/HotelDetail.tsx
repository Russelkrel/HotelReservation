import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { hotelAPI, roomAPI, reservationAPI } from '../api'

interface Room {
  id: number
  roomNumber: string
  type: string
  price: number
  capacity: number
  description: string | null
  imageUrl: string | null
  isAvailable: boolean
}

interface Hotel {
  id: number
  name: string
  location: string
  description: string | null
  rating: number
  imageUrl: string | null
}

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const hotelRes = await hotelAPI.getHotelById(parseInt(id || '0'))
        setHotel(hotelRes.data)
        
        const roomsRes = await roomAPI.getRoomsByHotel(parseInt(id || '0'))
        setRooms(roomsRes.data)
      } catch (err) {
        setError('Failed to load hotel details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Calculate total price
  useEffect(() => {
    if (selectedRoom && checkIn && checkOut) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      if (nights > 0) {
        setTotalPrice(selectedRoom.price * nights)
      }
    }
  }, [selectedRoom, checkIn, checkOut])

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!selectedRoom || !checkIn || !checkOut) {
      setError('Please select a room and dates')
      return
    }

    try {
      setBooking(true)
      setError(null)
      await reservationAPI.createReservation({
        roomId: selectedRoom.id,
        checkInDate: new Date(checkIn).toISOString(),
        checkOutDate: new Date(checkOut).toISOString(),
      })
      alert('Booking successful!')
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-xl">Loading...</div>
  }

  if (!hotel) {
    return <div className="text-center py-12 text-red-500 text-xl">Hotel not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hotel Header */}
        <div className="mb-8">
          <img 
            src={hotel.imageUrl || 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(hotel.name)} 
            alt={hotel.name} 
            className="w-full h-96 object-cover rounded-lg shadow-lg" 
          />
          <h1 className="text-4xl font-bold mt-6 mb-2 text-gray-800">{hotel.name}</h1>
          <p className="text-xl text-gray-600 mb-4">📍 {hotel.location}</p>
          <p className="text-gray-700 text-lg mb-4">{hotel.description || 'A wonderful place to stay'}</p>
          <div className="text-2xl text-yellow-500 font-bold">⭐ {hotel.rating.toFixed(1)}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rooms List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Rooms</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            
            <div className="space-y-4">
              {rooms.length === 0 ? (
                <p className="text-gray-600">No rooms available</p>
              ) : (
                rooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room)
                      setError(null)
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      selectedRoom?.id === room.id
                        ? 'border-2 border-blue-500 bg-blue-50'
                        : 'border border-gray-200 bg-white hover:border-blue-400'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img 
                        src={room.imageUrl || 'https://via.placeholder.com/100?text=Room'} 
                        alt={room.type} 
                        className="w-24 h-24 object-cover rounded" 
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{room.type} Room</h3>
                        <p className="text-gray-600">Room #{room.roomNumber}</p>
                        <p className="text-gray-600">Capacity: {room.capacity} guests</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">${room.price}/night</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-lg sticky top-4">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Book Now</h3>

              {selectedRoom && (
                <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
                  <p className="font-bold text-gray-800">{selectedRoom.type} Room</p>
                  <p className="text-blue-600 text-lg font-bold">${selectedRoom.price}/night</p>
                  {totalPrice > 0 && (
                    <p className="text-gray-700 mt-2">Total: <span className="font-bold">${totalPrice.toFixed(2)}</span></p>
                  )}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Check-in Date</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!selectedRoom || !checkIn || !checkOut || booking}
                className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
              >
                {booking ? 'Booking...' : 'Book Room'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
