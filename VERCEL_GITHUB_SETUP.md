# 🔗 Vercel + GitHub Auto-Deployment Setup

## ✅ Changes Pushed to GitHub

All fixes have been committed and pushed to:
**Repository**: https://github.com/Adarsh-Pandey-25/Uber-fleet-manage.git

### Latest Commits:
1. ✅ Fix API 404 error: Add root /api endpoint and update Vercel routing
2. ✅ Deploy to Vercel: Add deployment configs, fix SPA routing, update documentation

## 🔄 Enable Auto-Deployment from GitHub

To automatically deploy when you push to GitHub:

### Option 1: Connect GitHub Repository in Vercel (Recommended)

1. **Go to Vercel Dashboard**:
   - Frontend: https://vercel.com/adarsh-pandeys-projects-f81698fb/client
   - Backend: https://vercel.com/adarsh-pandeys-projects-f81698fb/server

2. **Go to Settings → Git**:
   - Click "Connect Git Repository"
   - Select your GitHub account
   - Choose repository: `Uber-fleet-manage`
   - Select the branch: `main`
   - For **Frontend**: Set Root Directory to `client`
   - For **Backend**: Set Root Directory to `server`

3. **Configure Build Settings**:
   - **Frontend**:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
   
   - **Backend**:
     - Framework Preset: Other
     - Build Command: (leave empty or `npm install`)
     - Output Directory: (leave empty)

4. **Set Environment Variables** (if not already set):
   - **Frontend**: `VITE_API_URL = https://server-black-iota-64.vercel.app/api`
   - **Backend**: 
     - `MONGODB_URI = your_mongodb_uri`
     - `JWT_SECRET = your_jwt_secret`
     - `FRONTEND_URL = https://client-green-phi.vercel.app`

5. **Deploy**: Vercel will automatically deploy on every push to `main` branch

### Option 2: Manual Deployment (Current Setup)

If you prefer manual deployments:
```bash
# Frontend
cd client
npx vercel --prod

# Backend
cd server
npx vercel --prod
```

## 📝 Important Notes

1. **Environment Variables**: 
   - Already set in Vercel dashboard
   - Will be preserved when connecting GitHub
   - No need to re-enter them

2. **Build Settings**:
   - Frontend uses Vite (auto-detected)
   - Backend uses Node.js serverless functions
   - Both configurations are in `vercel.json` files

3. **Auto-Deployment**:
   - Once connected, every `git push` will trigger a new deployment
   - You can see deployment status in Vercel dashboard
   - Failed deployments will be marked in the dashboard

## 🎯 Next Steps

1. ✅ Changes are already pushed to GitHub
2. ⏳ Connect GitHub repository in Vercel (if you want auto-deployment)
3. ✅ Manual deployments will continue to work as before

## 🔍 Verify Auto-Deployment

After connecting GitHub:
1. Make a small change (e.g., update README)
2. Commit and push: `git push origin main`
3. Check Vercel dashboard - you should see a new deployment starting automatically

## 📚 Resources

- **Vercel Git Integration**: https://vercel.com/docs/concepts/git
- **GitHub Repository**: https://github.com/Adarsh-Pandey-25/Uber-fleet-manage
- **Vercel Dashboard**: https://vercel.com/dashboard

