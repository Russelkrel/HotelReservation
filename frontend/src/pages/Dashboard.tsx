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
  modificationCount: number
  room: {
    roomNumber: string
    type: string
    price: number
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
  const [success, setSuccess] = useState<string | null>(null)
  const [showModifyModal, setShowModifyModal] = useState<number | null>(null)
  const [modifyData, setModifyData] = useState({ checkInDate: '', checkOutDate: '' })
  const [modifying, setModifying] = useState(false)
  const [downloading, setDownloading] = useState<number | null>(null)

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
        setSuccess('Reservation cancelled successfully')
        setTimeout(() => setSuccess(null), 3000)
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to cancel reservation')
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  const openModifyModal = (reservation: Reservation) => {
    setShowModifyModal(reservation.id)
    setModifyData({
      checkInDate: reservation.checkInDate.split('T')[0],
      checkOutDate: reservation.checkOutDate.split('T')[0]
    })
  }

  const handleModifyReservation = async () => {
    if (!modifyData.checkInDate || !modifyData.checkOutDate) {
      setError('Both dates are required')
      return
    }

    try {
      setModifying(true)
      setError(null)
      const response = await reservationAPI.modifyReservation(showModifyModal!, {
        checkInDate: modifyData.checkInDate,
        checkOutDate: modifyData.checkOutDate
      })
      
      setReservations(reservations.map(r => r.id === showModifyModal ? response.data.reservation : r))
      setShowModifyModal(null)
      setSuccess(`Reservation updated! Price change: $${response.data.priceChange.toFixed(2)}`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to modify reservation')
    } finally {
      setModifying(false)
    }
  }

  const handleDownloadPDF = async (id: number) => {
    try {
      setDownloading(id)
      const response = await reservationAPI.downloadPDF(id)
      
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `booking-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setError('Failed to download PDF')
      console.error(err)
    } finally {
      setDownloading(null)
    }
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
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

        {/* Alerts */}
        {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">{error}</div>}
        {success && <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4">{success}</div>}

        {/* Reservations */}
        <div className="animate-card-fade-in" style={{animationDelay: '0.2s'}}>
          <h2 className="text-2xl font-bold mb-6 text-white">My Reservations</h2>
          
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
                    <div className="pt-4 flex gap-2 justify-end">
                      {res.status !== 'CANCELLED' && (
                        <>
                          <button 
                            onClick={() => openModifyModal(res)}
                            className="text-blue-400 hover:text-blue-300 font-semibold text-sm smooth-transition"
                            title="Modify dates"
                          >
                            Modify
                          </button>
                          <button 
                            onClick={() => handleDownloadPDF(res.id)}
                            disabled={downloading === res.id}
                            className="text-green-400 hover:text-green-300 font-semibold text-sm smooth-transition disabled:opacity-50"
                            title="Download PDF"
                          >
                            {downloading === res.id ? 'Downloading...' : 'Download'}
                          </button>
                        </>
                      )}
                      {res.status !== 'CANCELLED' && (
                        <button 
                          onClick={() => handleCancel(res.id)}
                          className="text-red-400 hover:text-red-300 font-semibold text-sm smooth-transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modify Modal */}
        {showModifyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Modify Reservation Dates</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">Check-in Date</label>
                  <input
                    type="date"
                    value={modifyData.checkInDate}
                    onChange={(e) => setModifyData({...modifyData, checkInDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-indigo-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">Check-out Date</label>
                  <input
                    type="date"
                    value={modifyData.checkOutDate}
                    onChange={(e) => setModifyData({...modifyData, checkOutDate: e.target.value})}
                    min={modifyData.checkInDate}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-indigo-500 outline-none"
                  />
                </div>

                {modifyData.checkInDate && modifyData.checkOutDate && (
                  <div className="pt-2 border-t border-gray-600">
                    <p className="text-gray-400 text-sm mb-2">New Total: <span className="text-indigo-400 font-bold text-lg">${(reservations.find(r => r.id === showModifyModal)?.room.price || 0) * calculateNights(modifyData.checkInDate, modifyData.checkOutDate)}.00</span></p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModifyModal(null)}
                  disabled={modifying}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModifyReservation}
                  disabled={modifying || !modifyData.checkInDate || !modifyData.checkOutDate}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition disabled:opacity-50"
                >
                  {modifying ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
