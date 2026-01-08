#!/bin/bash

# Kill existing processes
pkill -f "node dist/index.js"
pkill -f "vite"
sleep 1

# Start backend
cd /Users/russel_/Desktop/HotelReservation/backend
node dist/index.js > /tmp/backend.log 2>&1 &
echo "✓ Backend started on http://localhost:3001"

# Start frontend
cd /Users/russel_/Desktop/HotelReservation/frontend
npm run dev > /tmp/frontend.log 2>&1 &
echo "✓ Frontend started on http://localhost:3002"

sleep 2
echo ""
echo "Both servers are running!"
echo "Open Safari: http://localhost:3002"
