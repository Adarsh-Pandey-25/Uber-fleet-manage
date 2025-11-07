# Deployment Guide - Vercel

This guide will help you deploy the Uber Fleet Driver Management System to Vercel.

## 🚀 Deployment Steps

### Option 1: Deploy Frontend and Backend Separately (Recommended)

#### Backend Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to server directory**:
   ```bash
   cd server
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy the backend**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked "Set up and deploy?", choose **Yes**
   - When asked "Which scope?", select your account
   - When asked "Link to existing project?", choose **No**
   - When asked "What's your project's name?", enter `uber-fleet-backend`
   - When asked "In which directory is your code located?", enter `.` (current directory)
   - When asked "Override settings?", choose **No**

5. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add PORT
   ```
   - Enter your MongoDB Atlas connection string for `MONGODB_URI`
   - Enter a secure random string for `JWT_SECRET` (use `openssl rand -base64 32`)
   - Enter `5000` for `PORT` (or leave default)

6. **Redeploy with environment variables**:
   ```bash
   vercel --prod
   ```

7. **Note your backend URL** (e.g., `https://uber-fleet-backend.vercel.app`)

#### Frontend Deployment

1. **Navigate to client directory**:
   ```bash
   cd ../client
   ```

2. **Update API URL**:
   - Create a `.env.production` file:
   ```env
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```

3. **Deploy the frontend**:
   ```bash
   vercel
   ```
   - Follow the prompts similar to backend
   - Project name: `uber-fleet-frontend`

4. **Set Environment Variables** (if needed):
   ```bash
   vercel env add VITE_API_URL production
   ```
   - Enter your backend URL: `https://your-backend-url.vercel.app/api`

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy as Monorepo

1. **Navigate to root directory**:
   ```bash
   cd /Users/adarshpandey/Desktop/ub
   ```

2. **Create `vercel.json` in root**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/server.js",
         "use": "@vercel/node"
       },
       {
         "src": "client/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server/server.js"
       },
       {
         "src": "/(.*)",
         "dest": "/client/$1"
       }
     ]
   }
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

## 📝 Important Notes

### File Uploads
- **Current Setup**: Files are stored locally in `server/uploads/`
- **For Production**: Consider using:
  - **Cloudinary** (recommended for images)
  - **AWS S3**
  - **Google Cloud Storage**
  - **Vercel Blob Storage**

### Environment Variables

**Backend (Vercel)**:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A secure random string
- `NODE_ENV` - Set to `production`
- `PORT` - Optional (Vercel handles this)

**Frontend (Vercel)**:
- `VITE_API_URL` - Your backend API URL (e.g., `https://uber-fleet-backend.vercel.app/api`)

### MongoDB Atlas Configuration

1. Ensure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0) or add Vercel's IP ranges
2. Make sure your database user has read/write permissions

### CORS Configuration

The backend already has CORS enabled, but you may need to update it for production:

```javascript
app.use(cors({
  origin: ['https://your-frontend-url.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

## 🔧 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] MongoDB Atlas connection working
- [ ] Test admin registration
- [ ] Test driver login
- [ ] Test file uploads
- [ ] Update CORS settings if needed

## 🐛 Troubleshooting

### Backend Issues
- Check Vercel function logs: `vercel logs`
- Verify environment variables are set
- Check MongoDB Atlas network access

### Frontend Issues
- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend URL is accessible

### File Upload Issues
- Local file storage won't work on Vercel serverless
- Consider migrating to cloud storage (Cloudinary recommended)

