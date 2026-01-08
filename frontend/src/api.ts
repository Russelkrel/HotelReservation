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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
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
  cancelReservation: (id: number) => api.delete(`/reservations/${id}`)
};

export default api;
