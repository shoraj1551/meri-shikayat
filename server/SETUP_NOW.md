# Quick Setup Instructions - Email & Redis

## Current Status
- ✅ Docker installed (v27.3.1)
- ❌ Docker Desktop not running
- ⚠️ Email not configured
- ⚠️ Redis not configured

---

## Step 1: Start Docker Desktop (2 minutes)

1. **Open Docker Desktop**
   - Press Windows key
   - Type "Docker Desktop"
   - Click to open
   - Wait for Docker to start (green icon in system tray)

2. **Verify Docker is Running**
   ```powershell
   docker ps
   ```
   Should show running containers (or empty list, not an error)

---

## Step 2: Setup Redis (5 minutes)

### Option A: Automated Setup
```powershell
cd server

# Start Redis container
docker run -d --name meri-shikayat-redis -p 6379:6379 redis:7-alpine

# Verify it's running
docker ps

# Test connection
docker exec -it meri-shikayat-redis redis-cli ping
# Should return: PONG
```

### Option B: Use Setup Script
```powershell
cd server
.\setup-services.ps1
```

---

## Step 3: Configure Email (10 minutes)

### A. Generate Gmail App Password

1. **Enable 2FA** (if not already enabled)
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow setup wizard

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Name: `Meri Shikayat Dev`
   - Click "Generate"
   - **Copy the 16-character password**

### B. Update .env File

1. **Open .env file**
   ```powershell
   cd server
   notepad .env
   ```

2. **Add these lines** (or update existing ones):
   ```env
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0
   ```

3. **Replace:**
   - `your-email@gmail.com` with your actual Gmail
   - `xxxx xxxx xxxx xxxx` with the app password you copied

4. **Save and close**

---

## Step 4: Restart Server (2 minutes)

1. **Stop current server**
   - Go to terminal running `npm start`
   - Press `Ctrl+C`

2. **Start server again**
   ```powershell
   npm start
   ```

3. **Check logs for:**
   ```
   ✅ Email service is ready
   ✅ Redis connected successfully
   ✅ Redis ready to accept commands
   ```

---

## Step 5: Verify Setup (5 minutes)

### Test Production Readiness
```powershell
npm run test:production
```

**Expected Output:**
```
✅ Environment Variables: PASS
✅ MongoDB: PASS
✅ Redis: PASS
✅ Email: PASS

🎉 PRODUCTION READY!
```

### Test Email Service

1. **Open browser:** http://localhost:3000/login
2. **Click "Forgot Password"**
3. **Enter your email**
4. **Click "Send OTP"**
5. **Check your inbox** - You should receive OTP email

### Test Redis

1. **Make multiple rapid requests** to any API endpoint
2. **Check rate limiting** is working
3. **Restart server** - Rate limits should persist

---

## Troubleshooting

### Docker Desktop Won't Start
- Restart computer
- Check Windows updates
- Reinstall Docker Desktop

### Redis Container Won't Start
```powershell
# Check if port 6379 is in use
netstat -ano | findstr :6379

# Remove existing container
docker rm -f meri-shikayat-redis

# Try again
docker run -d --name meri-shikayat-redis -p 6379:6379 redis:7-alpine
```

### Email Not Working
- Verify 2FA is enabled
- Use app password, not regular password
- Check spam folder
- Try different email address

---

## Quick Commands

```powershell
# Start Docker Desktop
# (Use Windows search)

# Start Redis
docker start meri-shikayat-redis

# Stop Redis
docker stop meri-shikayat-redis

# View Redis logs
docker logs meri-shikayat-redis

# Test Redis
docker exec -it meri-shikayat-redis redis-cli ping

# Restart server
cd server
npm start

# Test configuration
npm run test:production
```

---

## Next Steps After Setup

1. ✅ Both services configured
2. ✅ Tests passing
3. 🚀 Ready to deploy to Vercel!

Follow the Vercel deployment guide to go live.

---

**Estimated Time:** 20-25 minutes  
**Difficulty:** Easy

**Need help?** Check the detailed guide: `email_redis_setup.md`
