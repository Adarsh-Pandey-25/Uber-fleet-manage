# 🚀 Start Development Servers

## Quick Start

### Terminal 1 - Backend Server
```bash
cd server
npm install  # If not already installed
npm run dev  # Starts server on http://localhost:5000
```

### Terminal 2 - Frontend Client
```bash
cd client
npm install  # If not already installed
npm run dev  # Starts frontend on http://localhost:3000
```

## ⚠️ Important

**Both servers must be running** for the application to work in development mode.

- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:3000`

## 🔧 Troubleshooting

### Error: `ECONNREFUSED` or `http proxy error`

This means the backend server is not running. 

**Solution**: Start the backend server first:
```bash
cd server
npm run dev
```

### Port Already in Use

If port 5000 is already in use:
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in server/.env
PORT=5001
```

### MongoDB Connection Error

Make sure your `server/.env` file has:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## 📝 Development Workflow

1. **Start Backend** (Terminal 1):
   ```bash
   cd server
   npm run dev
   ```
   Wait for: `✅ Connected to MongoDB Atlas` and `🚀 Server running on port 5000`

2. **Start Frontend** (Terminal 2):
   ```bash
   cd client
   npm run dev
   ```
   Wait for: `Local: http://localhost:3000`

3. **Open Browser**: http://localhost:3000

## 🎯 Production

For production, use the Vercel deployments:
- Frontend: https://client-green-phi.vercel.app
- Backend: https://server-black-iota-64.vercel.app

