# 🔧 Fix MongoDB Connection for Vercel

## ⚠️ Issue: "Database connection unavailable"

This error occurs when Vercel serverless functions cannot connect to MongoDB Atlas.

## ✅ Solution: Configure MongoDB Atlas Network Access

### Step 1: Whitelist All IPs (Recommended for Vercel)

1. **Go to MongoDB Atlas Dashboard**:
   - Visit: https://cloud.mongodb.com
   - Log in to your account

2. **Navigate to Network Access**:
   - Click on your project
   - Go to **Network Access** (left sidebar)
   - Click **Add IP Address**

3. **Allow All IPs**:
   - Click **Allow Access from Anywhere**
   - Or manually add: `0.0.0.0/0`
   - Click **Confirm**

   ⚠️ **Note**: This allows access from any IP. For production, consider whitelisting specific Vercel IP ranges.

### Step 2: Verify Connection String

1. **Check Connection String Format**:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

2. **Verify in Vercel**:
   ```bash
   cd server
   npx vercel env ls
   ```
   - Make sure `MONGODB_URI` is set correctly
   - The connection string should NOT have `<password>` or `<dbname>` placeholders

3. **Update if Needed**:
   ```bash
   cd server
   echo "your_connection_string_here" | npx vercel env rm MONGODB_URI production --yes
   echo "your_connection_string_here" | npx vercel env add MONGODB_URI production
   ```

### Step 3: Verify Database User

1. **Go to Database Access**:
   - In MongoDB Atlas, go to **Database Access**
   - Verify your database user exists and is active

2. **Check User Permissions**:
   - User should have **Read and write** permissions
   - Or **Atlas admin** role

### Step 4: Test Connection

After updating network access, wait 1-2 minutes, then:

1. **Redeploy Backend**:
   ```bash
   cd server
   npx vercel --prod
   ```

2. **Test Login**:
   - Try logging in from the frontend
   - Check Vercel logs for connection status

## 🔍 Troubleshooting

### Check Vercel Logs
```bash
cd server
npx vercel logs https://server-black-iota-64.vercel.app
```

Look for:
- `✅ Connected to MongoDB Atlas` - Success
- `❌ MongoDB connection error` - Check error message

### Common Errors

1. **"ENOTFOUND"**:
   - Connection string is incorrect
   - Cluster is paused or deleted

2. **"Authentication failed"**:
   - Username/password incorrect
   - User doesn't have proper permissions

3. **"Timeout"**:
   - Network access not configured
   - IP not whitelisted

### Alternative: Whitelist Vercel IP Ranges

If you don't want to allow all IPs, you can whitelist Vercel's IP ranges:
- Check Vercel's documentation for current IP ranges
- Add them individually in MongoDB Atlas Network Access

## 📝 Quick Fix Checklist

- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0` (all IPs)
- [ ] Connection string is correct in Vercel environment variables
- [ ] Database user has proper permissions
- [ ] Cluster is running (not paused)
- [ ] Backend redeployed after changes

## 🚀 After Fixing

1. Wait 1-2 minutes for network access changes to propagate
2. Clear browser cache
3. Try logging in again
4. Check Vercel logs to verify connection

The connection should work now! 🎉

