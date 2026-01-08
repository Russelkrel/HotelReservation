import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { hotelAPI } from '../api'

interface Hotel {
  id: number
  name: string
  location: string
  description: string | null
  rating: number
  imageUrl: string | null
}

export default function Home() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('0')

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true)
        const response = await hotelAPI.getAllHotels()
        setHotels(response.data)
        setFilteredHotels(response.data)
      } catch (err: any) {
        setError('Failed to fetch hotels')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchHotels()
  }, [])

  // Filter hotels based on search criteria
  useEffect(() => {
    let filtered = hotels

    // Filter by search term (name or location)
    if (searchTerm) {
      filtered = filtered.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by location
    if (locationFilter) {
      filtered = filtered.filter(hotel =>
        hotel.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    // Filter by rating
    if (ratingFilter && ratingFilter !== '0') {
      filtered = filtered.filter(hotel => hotel.rating >= parseFloat(ratingFilter))
    }

    setFilteredHotels(filtered)
  }, [searchTerm, locationFilter, ratingFilter, hotels])


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
          <h1 className="text-5xl font-bold mb-4">Find Your Perfect Hotel</h1>
          <p className="text-xl opacity-90">Discover amazing hotels and book your stay today</p>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-100">Featured Hotels</h2>
        
        {/* Search and Filter Section */}
        <div className="bg-gray-800 p-4 rounded-lg mb-8 border border-gray-700 mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Search Hotel Name</label>
              <input
                type="text"
                placeholder="e.g., Luxury Plaza"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Filter by location */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">All Locations</option>
                <option value="New York">New York</option>
                <option value="Miami">Miami</option>
                <option value="Denver">Denver</option>
              </select>
            </div>

            {/* Filter by rating */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Minimum Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="0">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-gray-400">
          Showing {filteredHotels.length} of {hotels.length} hotels
        </div>
        {error && <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">{error}</div>}
        
        {filteredHotels.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {hotels.length === 0 ? 'No hotels available' : 'No hotels match your search criteria'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map(hotel => (
              <Link key={hotel.id} to={`/hotel/${hotel.id}`}>
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer h-full border border-gray-700 hover:border-blue-500">
                  <img 
                    src={hotel.imageUrl || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(hotel.name)} 
                    alt={hotel.name} 
                    className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300" 
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-100 mb-2 hover:text-blue-400 transition-colors duration-200">{hotel.name}</h3>
                    <p className="text-gray-400 mb-2">{hotel.location}</p>
                    <p className="text-gray-300 text-sm mb-4">{hotel.description || 'A wonderful place to stay'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-500 font-bold">⭐ {hotel.rating.toFixed(1)}</span>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 hover:scale-110 transition-all duration-200">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
