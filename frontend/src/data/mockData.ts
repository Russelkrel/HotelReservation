export const mockHotels = [
  {
    id: 1,
    name: 'Luxury Plaza Hotel',
    location: 'New York City',
    description: 'Experience luxury in the heart of Manhattan',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=300&fit=crop',
    rooms: [
      { id: 1, roomNumber: '101', type: 'Single', price: 99, capacity: 1, imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop' },
      { id: 2, roomNumber: '102', type: 'Double', price: 149, capacity: 2, imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop' },
      { id: 3, roomNumber: '103', type: 'Suite', price: 249, capacity: 4, imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop' },
    ]
  },
  {
    id: 2,
    name: 'Beachfront Resort',
    location: 'Miami, Florida',
    description: 'Beautiful oceanfront resort with stunning views',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop',
    rooms: [
      { id: 4, roomNumber: '201', type: 'Single', price: 89, capacity: 1, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop' },
      { id: 5, roomNumber: '202', type: 'Double', price: 139, capacity: 2, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop' },
      { id: 6, roomNumber: '203', type: 'Suite', price: 229, capacity: 4, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop' },
    ]
  },
  {
    id: 3,
    name: 'Mountain View Hotel',
    location: 'Denver, Colorado',
    description: 'Scenic mountain views and outdoor activities',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3a4?w=500&h=300&fit=crop',
    rooms: [
      { id: 7, roomNumber: '301', type: 'Single', price: 79, capacity: 1, imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3a4?w=400&h=300&fit=crop' },
      { id: 8, roomNumber: '302', type: 'Double', price: 129, capacity: 2, imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3a4?w=400&h=300&fit=crop' },
      { id: 9, roomNumber: '303', type: 'Suite', price: 199, capacity: 4, imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3a4?w=400&h=300&fit=crop' },
    ]
  }
]

export const mockReservations = [
  {
    id: 1,
    hotelName: 'Luxury Plaza Hotel',
    roomType: 'Double',
    checkInDate: '2026-01-15',
    checkOutDate: '2026-01-18',
    totalPrice: 447,
    status: 'CONFIRMED'
  }
]
