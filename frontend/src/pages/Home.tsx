import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { hotelAPI, roomAPI } from '../api'

interface Hotel {
  id: number
  name: string
  location: string
  description: string | null
  rating: number
  imageUrl: string | null
}

interface Room {
  id: number
  price: number
  hotelId: number
}

export default function Home() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [roomsByHotel, setRoomsByHotel] = useState<{ [key: number]: Room[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('name')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000)
  const [maxAvailablePrice, setMaxAvailablePrice] = useState(1000)
  const [searchLocation, setSearchLocation] = useState('')

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true)
        // Add timeout - if request takes more than 5 seconds, fail
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        console.log('Fetching from:', 'http://localhost:3000/hotels')
        const response = await hotelAPI.getAllHotels()
        clearTimeout(timeoutId)
        
        console.log('Got response:', response.data)
        setHotels(response.data)

        // Fetch rooms for each hotel to get pricing info
        const roomsMap: { [key: number]: Room[] } = {}
        let maxPrice = 0
        
        for (const hotel of response.data) {
          try {
            const roomsRes = await roomAPI.getRoomsByHotel(hotel.id)
            roomsMap[hotel.id] = roomsRes.data
            // Update max price
            roomsRes.data.forEach((room: Room) => {
              if (room.price > maxPrice) {
                maxPrice = room.price
              }
            })
          } catch (err) {
            console.error(`Failed to fetch rooms for hotel ${hotel.id}`, err)
            roomsMap[hotel.id] = []
          }
        }
        
        setRoomsByHotel(roomsMap)
        setMaxAvailablePrice(maxPrice || 1000)
        setMaxPrice(maxPrice || 1000)
      } catch (err: any) {
        const errorMsg = err.code === 'ECONNABORTED' 
          ? 'Request timeout - backend not responding'
          : err.response?.data?.message || err.message || 'Unknown error'
        console.error('API Error:', errorMsg, err)
        setError(`Failed to fetch hotels: ${errorMsg}`)
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-100">Loading hotels...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-2">🚀 JOSHTEL</h1>
          <p className="text-2xl font-bold mb-4">Find Your Perfect Hotel</p>
          <p className="text-xl opacity-90">Discover amazing hotels and book your stay today</p>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-100 mb-8">Featured Hotels</h2>
        
        {/* Filters and Sorting */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search Location */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Search Location</label>
              <input 
                type="text"
                placeholder="e.g., New York, Paris..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500 placeholder-gray-500"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: High to Low</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Min Price: ${minPrice}</label>
              <input 
                type="range"
                min="0"
                max={maxAvailablePrice}
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-400 mt-1">$0 - ${maxAvailablePrice}</div>
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Max Price: ${maxPrice}</label>
              <input 
                type="range"
                min="0"
                max={maxAvailablePrice}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-400 mt-1">$0 - ${maxAvailablePrice}</div>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">{error}</div>}
        
        {hotels.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No hotels available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels
              .filter(hotel => {
                // Check if hotel has rooms within price range
                const hotelRooms = roomsByHotel[hotel.id] || []
                if (hotelRooms.length === 0) return false
                const hasRoomInRange = hotelRooms.some(room => room.price >= minPrice && room.price <= maxPrice)
                
                // Check if hotel location matches search (case-insensitive, partial match)
                const locationMatch = hotel.location.toLowerCase().includes(searchLocation.toLowerCase())
                
                return hasRoomInRange && locationMatch
              })
              .sort((a, b) => {
                // Get min price for each hotel
                const aRooms = roomsByHotel[a.id] || []
                const bRooms = roomsByHotel[b.id] || []
                const aMinPrice = aRooms.length > 0 ? Math.min(...aRooms.map(r => r.price)) : Infinity
                const bMinPrice = bRooms.length > 0 ? Math.min(...bRooms.map(r => r.price)) : Infinity

                if (sortBy === 'name') {
                  return a.name.localeCompare(b.name)
                } else if (sortBy === 'price-low') {
                  return aMinPrice - bMinPrice
                } else if (sortBy === 'price-high') {
                  return bMinPrice - aMinPrice
                } else if (sortBy === 'rating') {
                  return (b.rating || 0) - (a.rating || 0)
                }
                return 0
              })
              .map(hotel => {
                const hotelRooms = roomsByHotel[hotel.id] || []
                const minRoomPrice = hotelRooms.length > 0 ? Math.min(...hotelRooms.map(r => r.price)) : 'N/A'
                
                return (
                  <Link key={hotel.id} to={`/hotel/${hotel.id}`}>
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer h-full border border-gray-700 hover:border-blue-500">
                      <img 
                        src={hotel.imageUrl || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(hotel.name)} 
                        alt={hotel.name} 
                        className="w-full h-48 object-cover" 
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-100 mb-2">{hotel.name}</h3>
                        <p className="text-gray-300 mb-2">{hotel.location}</p>
                        <p className="text-gray-400 text-sm mb-4">{hotel.description || 'A wonderful place to stay'}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-yellow-500 font-bold">⭐ {hotel.rating.toFixed(1)}</span>
                          {minRoomPrice !== 'N/A' && (
                            <span className="text-blue-400 font-bold">from ${minRoomPrice}/night</span>
                          )}
                        </div>
                        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                          View Details
                        </button>
                      </div>
                    </div>
                  </Link>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
