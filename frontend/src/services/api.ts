import axios from 'axios';

const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

// Hotels API
export const hotelsAPI = {
  getAll: () => api.get('/hotels'),
  getById: (id: number) => api.get(`/hotels/${id}`),
  create: (data: any) => api.post('/hotels', data),
  update: (id: number, data: any) => api.put(`/hotels/${id}`, data),
  delete: (id: number) => api.delete(`/hotels/${id}`),
};

// Rooms API
export const roomsAPI = {
  getByHotel: (hotelId: number) => api.get(`/rooms/hotel/${hotelId}`),
  create: (hotelId: number, data: any) => api.post(`/rooms/hotel/${hotelId}`, data),
  update: (id: number, data: any) => api.put(`/rooms/${id}`, data),
  delete: (id: number) => api.delete(`/rooms/${id}`),
};

// Reservations API
export const reservationsAPI = {
  create: (data: any) => api.post('/reservations', data),
  getMyReservations: () => api.get('/reservations/my-reservations'),
  getById: (id: number) => api.get(`/reservations/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch(`/reservations/${id}/status`, { status }),
  cancel: (id: number) => api.delete(`/reservations/${id}`),
  getAll: () => api.get('/reservations'),
};

export default api;
