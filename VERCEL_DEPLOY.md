# 🚀 Vercel Deployment Guide

Quick guide to deploy your Uber Fleet Driver Management System to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm i -g vercel
   ```
3. **MongoDB Atlas**: Your database should be set up and accessible

## 🎯 Deployment Steps

### Step 1: Deploy Backend

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy backend**:
   ```bash
   vercel
   ```
   - Follow prompts (create new project, name it `uber-fleet-backend`)

4. **Set Environment Variables**:
   ```bash
   vercel env add MONGODB_URI
   # Paste your MongoDB Atlas connection string
   
   vercel env add JWT_SECRET
   # Enter a secure random string (use: openssl rand -base64 32)
   
   vercel env add FRONTEND_URL
   # Enter your frontend URL (will be set after frontend deployment)
   ```

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

6. **Note your backend URL** (e.g., `https://uber-fleet-backend.vercel.app`)

### Step 2: Deploy Frontend

1. **Navigate to client directory**:
   ```bash
   cd ../client
   ```

2. **Deploy frontend**:
   ```bash
   vercel
   ```
   - Follow prompts (create new project, name it `uber-fleet-frontend`)

3. **Set Environment Variable**:
   ```bash
   vercel env add VITE_API_URL production
   # Enter: https://your-backend-url.vercel.app/api
   # Replace 'your-backend-url' with your actual backend URL
   ```

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

5. **Update Backend CORS**:
   - Go back to server directory
   ```bash
   cd ../server
   vercel env add FRONTEND_URL production
   # Enter your frontend URL: https://uber-fleet-frontend.vercel.app
   vercel --prod
   ```

## ⚠️ Important: File Uploads

**Vercel serverless functions don't support persistent file storage.**

The current implementation stores files locally, which **won't work on Vercel**. You have two options:

### Option A: Use Cloudinary (Recommended)

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Install Cloudinary SDK:
   ```bash
   cd server
   npm install cloudinary multer-storage-cloudinary
   ```
3. Update `server/middleware/uploadMiddleware.js` to use Cloudinary
4. Set environment variables:
   ```bash
   vercel env add CLOUDINARY_CLOUD_NAME
   vercel env add CLOUDINARY_API_KEY
   vercel env add CLOUDINARY_API_SECRET
   ```

### Option B: Use Vercel Blob Storage

1. Install Vercel Blob:
   ```bash
   cd server
   npm install @vercel/blob
   ```
2. Update upload middleware to use Vercel Blob
3. Set `BLOB_READ_WRITE_TOKEN` environment variable

### Option C: Use Alternative Backend Hosting

For file uploads to work with local storage, consider:
- **Railway** (railway.app)
- **Render** (render.com)
- **Heroku** (heroku.com)
- **DigitalOcean App Platform**

## 🔧 Environment Variables Summary

### Backend (Vercel)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secure random string
- `FRONTEND_URL` - Your frontend URL (for CORS)
- `NODE_ENV` - Set to `production` (auto-set by Vercel)

### Frontend (Vercel)
- `VITE_API_URL` - Backend API URL (e.g., `https://uber-fleet-backend.vercel.app/api`)

## 📝 Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] Test admin registration: `https://your-frontend-url.vercel.app/admin/register`
- [ ] Test driver login
- [ ] Test file uploads (if using cloud storage)
- [ ] MongoDB Atlas network access allows Vercel IPs (or use 0.0.0.0/0)

## 🐛 Troubleshooting

### Backend Issues
```bash
# View logs
vercel logs

# Check environment variables
vercel env ls
```

### Frontend Issues
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Check CORS errors (update backend `FRONTEND_URL`)

### MongoDB Connection
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Verify connection string is correct
- Check database user permissions

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Cloudinary**: https://cloudinary.com (for file uploads)

## 📞 Need Help?

1. Check Vercel logs: `vercel logs`
2. Check MongoDB Atlas logs
3. Test API endpoints directly: `https://your-backend-url.vercel.app/api/health`

