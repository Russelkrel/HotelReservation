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
  amenities: string[]
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
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false)

  // Map amenities to emoji icons
  const amenityIcons: { [key: string]: string } = {
    'WiFi': '📶',
    'Air Conditioning': '❄️',
    'TV': '📺',
    'Work Desk': '💼',
    'Safe': '🔐',
    'Coffee Maker': '☕',
    'Swimming Pool Access': '🏊',
    'Parking': '🅿️',
    'Gym Access': '🏋️',
    'Hot Tub': '🛁',
    'Spa': '💆',
    'Balcony': '🌅',
    'Mini Bar': '🥃',
  }

  // Calculate cancellation policy
  const calculateCancellationPolicy = (checkInDate: string) => {
    if (!checkInDate) return null;
    
    const checkIn = new Date(checkInDate);
    const now = new Date();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysUntilCheckIn = Math.floor(
      (checkIn.getTime() - now.getTime()) / millisecondsPerDay
    );

    if (daysUntilCheckIn >= 7) {
      return {
        policy: 'Free Cancellation',
        refundPercentage: 100,
        refundAmount: totalPrice,
        description: `Free cancellation until ${new Date(checkIn.getTime() - 7 * millisecondsPerDay).toLocaleDateString()}`,
      };
    }

    if (daysUntilCheckIn >= 3) {
      return {
        policy: 'Partial Refund (50%)',
        refundPercentage: 50,
        refundAmount: totalPrice * 0.5,
        description: `50% refund until ${new Date(checkIn.getTime() - 3 * millisecondsPerDay).toLocaleDateString()}`,
      };
    }

    return {
      policy: 'Non-Refundable',
      refundPercentage: 0,
      refundAmount: 0,
      description: `No refund after ${new Date(checkIn.getTime() - 3 * millisecondsPerDay).toLocaleDateString()}`,
    };
  };

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
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hotel Header */}
        <div className="mb-8">
          <img 
            src={hotel.imageUrl || 'https://via.placeholder.com/800x400?text=' + encodeURIComponent(hotel.name)} 
            alt={hotel.name} 
            className="w-full h-96 object-cover rounded-lg shadow-lg" 
          />
          <h1 className="text-4xl font-bold mt-6 mb-2 text-gray-100">{hotel.name}</h1>
          <p className="text-xl text-gray-300 mb-4">📍 {hotel.location}</p>
          <p className="text-gray-400 text-lg mb-4">{hotel.description || 'A wonderful place to stay'}</p>
          <div className="text-2xl text-yellow-500 font-bold">⭐ {hotel.rating.toFixed(1)}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rooms List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6 text-gray-100">Available Rooms</h2>
            {error && <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">{error}</div>}
            
            <div className="space-y-4">
              {rooms.length === 0 ? (
                <p className="text-gray-400">No rooms available</p>
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
                        ? 'border-2 border-blue-500 bg-gray-800 bg-opacity-50'
                        : 'border border-gray-700 bg-gray-800 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img 
                        src={room.imageUrl || 'https://via.placeholder.com/100?text=Room'} 
                        alt={room.type} 
                        className="w-24 h-24 object-cover rounded" 
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-100">{room.type} Room</h3>
                        <p className="text-gray-400">Room #{room.roomNumber}</p>
                        <p className="text-gray-400">Capacity: {room.capacity} guests</p>
                        <p className="text-2xl font-bold text-blue-400 mt-2">${room.price}/night</p>
                        
                        {/* Amenities */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {room.amenities.map((amenity, idx) => (
                              <span key={idx} className="text-sm bg-blue-900 bg-opacity-40 text-blue-300 px-2 py-1 rounded flex items-center gap-1">
                                {amenityIcons[amenity] || '✓'} {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg sticky top-4 border border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-gray-100">Book Now</h3>

              {selectedRoom && (
                <div className="mb-6 p-4 bg-blue-900 bg-opacity-30 rounded border border-blue-700">
                  <p className="font-bold text-gray-100">{selectedRoom.type} Room</p>
                  <p className="text-blue-400 text-lg font-bold">${selectedRoom.price}/night</p>
                  {totalPrice > 0 && (
                    <p className="text-gray-300 mt-2">Total: <span className="font-bold">${totalPrice.toFixed(2)}</span></p>
                  )}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Check-in Date</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-2">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Cancellation Policy */}
              {checkIn && calculateCancellationPolicy(checkIn) && (
                <div className="mb-6 p-4 bg-amber-900 bg-opacity-30 rounded border border-amber-700">
                  <button
                    onClick={() => setShowCancellationPolicy(!showCancellationPolicy)}
                    className="w-full text-left flex justify-between items-center"
                  >
                    <p className="text-amber-300 font-bold">📋 Cancellation Policy</p>
                    <span className="text-amber-300">{showCancellationPolicy ? '▼' : '▶'}</span>
                  </button>
                  
                  {showCancellationPolicy && calculateCancellationPolicy(checkIn) && (
                    <div className="mt-3 text-sm space-y-2">
                      <p className="text-gray-300">
                        <strong>{calculateCancellationPolicy(checkIn)!.policy}</strong>
                      </p>
                      <p className="text-gray-400">
                        {calculateCancellationPolicy(checkIn)!.description}
                      </p>
                      <p className="text-amber-300 font-semibold pt-2">
                        💰 Refund if cancelled: ${calculateCancellationPolicy(checkIn)!.refundAmount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!selectedRoom || !checkIn || !checkOut || booking}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-600"
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
