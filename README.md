# Uber Fleet Driver Management System

## 🚀 Quick Deploy to Vercel

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for detailed deployment instructions.

**Quick Start:**
1. Deploy backend: `cd server && vercel`
2. Deploy frontend: `cd client && vercel`
3. Set environment variables in Vercel dashboard

---

# Uber Fleet Driver Management System

A full-stack web application for managing Uber fleet drivers and their daily operations using the MERN stack.

## 🚀 Features

### Admin Panel
- **Dashboard**: Overview of total drivers, km driven, expenses, and collections
- **Driver Management**: Add, edit, remove (soft delete), and view all drivers
- **Driver Monitoring**: View daily logs for each driver with date filtering
- **Export**: Export driver logs as CSV or PDF
- **Analytics**: Charts and visualizations for revenue and collections

### Driver Panel
- **Dashboard**: Personal statistics (km, collections, expenses, earnings)
- **Daily Report**: Submit daily logs with date picker
- **History**: View and edit previous log entries with date filtering

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB Atlas (cloud database)
- Mongoose ODM
- JWT authentication
- Express Validator

### Frontend
- React 18
- Vite
- TailwindCSS
- Redux Toolkit
- React Router DOM
- React-Toastify
- Recharts
- React-Datepicker

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory (a template has been created for you):
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

   **To get your MongoDB Atlas connection string:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account or sign in
   - Create a new cluster (free tier is fine) - wait for it to finish provisioning
   - **Set up Database Access:**
     - Go to "Database Access" in the left sidebar
     - Click "Add New Database User"
     - Choose "Password" authentication
     - Create a username and password (save these!)
     - Set privileges to "Read and write to any database"
     - Click "Add User"
   - **Set up Network Access:**
     - Go to "Network Access" in the left sidebar
     - Click "Add IP Address"
     - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
     - Click "Confirm"
   - **Get Connection String:**
     - Go back to "Database" → Click "Connect" on your cluster
     - Choose "Connect your application"
     - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
     - Replace `<password>` with the password you created for the database user
     - Add your database name before the `?` (e.g., `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/uber_fleet?retryWrites=true&w=majority`)
     - Paste it into the `.env` file as `MONGODB_URI`
   
   **Important:** Make sure you:
   - Replace `<password>` with your actual password (not the placeholder)
   - Add a database name in the connection string (e.g., `/uber_fleet`)
   - Wait a few minutes after creating the cluster before connecting
   - Ensure your IP is whitelisted in Network Access
   
   **For JWT_SECRET:**
   - Generate a random string (you can use: `openssl rand -base64 32`)
   - Or use any long random string (minimum 32 characters recommended)

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:3000`

## 🔐 Initial Setup

1. Start both backend and frontend servers
2. Navigate to `/admin/register` to create the first admin account
   - **Note:** Admin registration is on a separate route and not publicly linked from the login page
3. After registration, you'll be logged in automatically
4. Use the admin panel to create driver accounts
5. Drivers can log in using their **phone number** and password (not email)

## 📁 Project Structure

```
ub/
├── server/
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Driver.js
│   │   └── DailyLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── logRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── server.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── driver/
│   │   ├── store/
│   │   │   └── slices/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/driver/login` - Driver login
- `POST /api/auth/admin/register` - Create admin account

### Drivers (Admin only)
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/:id` - Get single driver
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver (soft delete)

### Daily Logs
- `GET /api/logs` - Get logs (filtered by driver, date range)
- `GET /api/logs/:id` - Get single log
- `POST /api/logs` - Create log entry
- `PUT /api/logs/:id` - Update log entry
- `DELETE /api/logs/:id` - Delete log entry
- `GET /api/logs/export/csv` - Export logs as CSV
- `GET /api/logs/export/pdf` - Export logs as PDF

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard stats
- `GET /api/dashboard/driver` - Driver dashboard stats
- `GET /api/dashboard/driver/:driverId/logs` - Get driver logs (admin only)

## 🎨 Features in Detail

### Admin Features
- **Total Drivers**: Count of all active drivers
- **Total KM Driven**: Sum of all kilometers from all drivers
- **Total Expenses**: Sum of fuel and other expenses
- **Cash vs Online Collections**: Breakdown of payment methods
- **Driver Management**: Full CRUD operations with search and sort
- **Driver Monitoring**: View individual driver logs with date filtering
- **Export**: Download logs as CSV or PDF

### Driver Features
- **Personal Dashboard**: Weekly/monthly statistics
- **Daily Report Form**: Submit daily logs with auto-calculation
- **History View**: View and edit previous entries
- **Date Filtering**: Filter logs by date range

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes (admin/driver separation)
- Input validation
- Soft delete for drivers

## 📝 Notes

- Drivers can only view/edit their own logs
- Admins can view all drivers and logs
- Daily logs are unique per driver per date
- All monetary values are stored in USD
- Dates are stored in UTC and displayed in local timezone

## 🚧 Future Enhancements

- Email notifications
- SMS alerts
- Advanced analytics and reporting
- Mobile app
- Real-time updates
- Multi-language support

## 📄 License

This project is open source and available under the MIT License.

