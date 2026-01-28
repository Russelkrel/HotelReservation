import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🔑 API Request:', config.url, 'Token:', token ? `${token.substring(0, 20)}...` : 'No token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to catch auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🚨 API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log('🚨 Authentication failed - removing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { name?: string; email?: string; profilePictureUrl?: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
  deleteAccount: (password: string) =>
    api.delete('/auth/account', { data: { password } })
};

// Hotel APIs
export const hotelAPI = {
  getAllHotels: () => api.get('/hotels'),
  getHotelById: (id: number) => api.get(`/hotels/${id}`)
};

// Room APIs
export const roomAPI = {
  getRoomsByHotel: (hotelId: number) => api.get(`/rooms/hotel/${hotelId}`)
};

// Reservation APIs
export const reservationAPI = {
  createReservation: (data: {
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
  }) => api.post('/reservations', data),
  getUserReservations: () => api.get('/reservations/my-reservations'),
  getReservationById: (id: number) => api.get(`/reservations/${id}`),
  cancelReservation: (id: number) => api.delete(`/reservations/${id}`),
  modifyReservation: (id: number, data: {
    checkInDate: string;
    checkOutDate: string;
  }) => api.put(`/reservations/${id}`, data),
  downloadPDF: (id: number) => api.get(`/reservations/${id}/pdf`, {
    responseType: 'blob'
  })
};

export default api;
