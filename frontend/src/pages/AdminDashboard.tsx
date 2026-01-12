import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

interface DashboardStats {
  totalHotels: number;
  totalRooms: number;
  totalReservations: number;
  totalRevenue: number;
}

interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  rating: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminMenuTab {
  id: string;
  label: string;
  icon: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalHotels: 0,
    totalRooms: 0,
    totalReservations: 0,
    totalRevenue: 0,
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    rating: 0,
  });

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Get all hotels and reservations
        const [hotelsRes, reservationsRes] = await Promise.all([
          api.get('/hotels'),
          api.get('/reservations'),
        ]);

        const hotels = hotelsRes.data;
        const reservations = reservationsRes.data;

        // Calculate total revenue from completed/confirmed reservations
        const totalRevenue = reservations.reduce((sum: number, res: any) => {
          return res.status === 'CONFIRMED' || res.status === 'COMPLETED' ? sum + res.totalPrice : sum;
        }, 0);

        setStats({
          totalHotels: hotels.length,
          totalRooms: reservations.length, // Placeholder
          totalReservations: reservations.length,
          totalRevenue,
        });
        setHotels(hotels);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Create or Update Hotel
  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHotel) {
        // Update hotel
        const response = await api.put(`/hotels/${editingHotel.id}`, formData);
        setHotels(hotels.map(h => h.id === editingHotel.id ? response.data.hotel : h));
        alert('Hotel updated successfully!');
      } else {
        // Create hotel
        const response = await api.post('/hotels', formData);
        setHotels([...hotels, response.data.hotel]);
        alert('Hotel created successfully!');
      }
      setShowCreateModal(false);
      setEditingHotel(null);
      setFormData({ name: '', location: '', description: '', rating: 0 });
    } catch (error) {
      console.error('Failed to save hotel:', error);
      alert('Failed to save hotel');
    }
  };

  // Delete Hotel
  const handleDeleteHotel = async (hotelId: number) => {
    try {
      await api.delete(`/hotels/${hotelId}`);
      setHotels(hotels.filter(h => h.id !== hotelId));
      setShowDeleteConfirm(null);
      alert('Hotel deleted successfully!');
    } catch (error) {
      console.error('Failed to delete hotel:', error);
      alert('Failed to delete hotel');
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingHotel(null);
    setFormData({ name: '', location: '', description: '', rating: 0 });
    setShowCreateModal(true);
  };

  // Open edit modal
  const openEditModal = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      rating: hotel.rating,
    });
    setShowCreateModal(true);
  };

  const menuTabs: AdminMenuTab[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'hotels', label: 'Hotels', icon: '🏨' },
    { id: 'rooms', label: 'Rooms', icon: '🛏️' },
    { id: 'reservations', label: 'Reservations', icon: '📅' },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Admin Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400">Welcome, {user?.name}</p>
      </div>

      <div className="flex">
        {/* Sidebar Menu */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 shadow-lg">
          <nav className="p-6">
            {menuTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center gap-2 transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">Dashboard Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
                  <div className="text-gray-400 text-sm font-semibold">Total Hotels</div>
                  <div className="text-4xl font-bold text-indigo-400">{stats.totalHotels}</div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
                  <div className="text-gray-400 text-sm font-semibold">Total Rooms</div>
                  <div className="text-4xl font-bold text-green-400">{stats.totalRooms}</div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
                  <div className="text-gray-400 text-sm font-semibold">Reservations</div>
                  <div className="text-4xl font-bold text-blue-400">{stats.totalReservations}</div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
                  <div className="text-gray-400 text-sm font-semibold">Total Revenue</div>
                  <div className="text-4xl font-bold text-emerald-400">${stats.totalRevenue.toFixed(2)}</div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4 text-white">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('hotels')}
                    className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition text-left"
                  >
                    <div className="font-bold text-lg">Manage Hotels</div>
                    <div className="text-indigo-300 text-sm">Add, edit, or delete hotels</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition text-left"
                  >
                    <div className="font-bold text-lg">Manage Rooms</div>
                    <div className="text-green-300 text-sm">Add, edit, or delete rooms</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition text-left"
                  >
                    <div className="font-bold text-lg">View Reservations</div>
                    <div className="text-blue-300 text-sm">Manage all bookings</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hotels' && (
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Hotel Management</h2>
                <button
                  onClick={openCreateModal}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  + New Hotel
                </button>
              </div>

              {hotels.length === 0 ? (
                <p className="text-gray-400">No hotels yet. Create one to get started!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                      <tr>
                        <th className="pb-3 text-gray-300">Name</th>
                        <th className="pb-3 text-gray-300">Location</th>
                        <th className="pb-3 text-gray-300">Rating</th>
                        <th className="pb-3 text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotels.map((hotel) => (
                        <tr key={hotel.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                          <td className="py-3 text-white">{hotel.name}</td>
                          <td className="py-3 text-gray-300">{hotel.location}</td>
                          <td className="py-3 text-yellow-400">★ {hotel.rating}</td>
                          <td className="py-3 space-x-2">
                            <button
                              onClick={() => openEditModal(hotel)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(hotel.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                            >
                              Delete
                            </button>
                            {showDeleteConfirm === hotel.id && (
                              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg">
                                  <p className="text-white mb-4">Are you sure you want to delete {hotel.name}?</p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleDeleteHotel(hotel.id)}
                                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                    >
                                      Yes, Delete
                                    </button>
                                    <button
                                      onClick={() => setShowDeleteConfirm(null)}
                                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Create/Edit Modal */}
              {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg w-96">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {editingHotel ? 'Edit Hotel' : 'Create New Hotel'}
                    </h3>
                    <form onSubmit={handleSaveHotel}>
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm mb-2">Hotel Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm mb-2">Location</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm mb-2">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-indigo-500 outline-none"
                          rows={3}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm mb-2">Rating (0-5)</label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={formData.rating}
                          onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                        >
                          {editingHotel ? 'Update' : 'Create'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateModal(false);
                            setEditingHotel(null);
                          }}
                          className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4 text-white">Room Management</h2>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4 text-white">Reservation Management</h2>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
