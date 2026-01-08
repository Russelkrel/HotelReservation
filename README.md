# Hotel Reservation System

A full-stack hotel reservation management system built with modern web technologies.

## Tech Stack

 Frontend
- React 18
- Vite
- Tailwind CSS
- React Router v6
- Axios

 Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt
- Cloudinary (Image Management)
- Multer (File Upload)

 Project Structure

```
HotelReservation/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
└── backend/           # Express.js backend
    ├── src/
    ├── prisma/
    ├── tsconfig.json
    └── package.json
```


Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your PostgreSQL and Cloudinary credentials
# Get Cloudinary credentials from https://cloudinary.com/
```

4. Run Prisma migrations:
```bash
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

 Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

Test Credentials

- **Email**: admin@test.com
- **Password**: admin123

 Features

- User authentication with JWT tokens
- Role-based access control with image uploads
- Image management with Cloudinary (Guest, Admin)
- Hotel and room management
- Reservation booking system
- Responsive design with Tailwind CSS

 Available Scripts

 Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Database Schema

The system includes the following models:
- **User** - System users with roles (Guest/Admin)
- **Hotel** - Hotel information
- **Room** - Room details within hotels
- **Reservation** - Guest reservations

## Authentication

Uses JWT (JSON Web Tokens) with access tokens for stateless authentication. Passwords are hashed using bcrypt.

 API Documentation

API routes will be documented as features are developed.

Contributing

Work in progress - Feature development ongoing.

 License

MIT
