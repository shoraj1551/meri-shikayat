# 🚀 Quick Start - Production Setup

This guide will help you configure Meri Shikayat for production deployment in **under 2 hours**.

---

## ⚡ Quick Setup (30 minutes)

### Step 1: Copy Environment Template (1 minute)
```bash
cd server
cp .env.example .env
```

### Step 2: Configure Critical Services (20 minutes)

#### A. MongoDB (5 minutes)
```bash
# Option 1: Local MongoDB
# Already running on your machine ✅

# Option 2: MongoDB Atlas (Free tier)
# 1. Go to https://www.mongodb.com/cloud/atlas
# 2. Create free cluster
# 3. Get connection string
# 4. Update .env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meri-shikayat-prod
```

#### B. JWT Secret (1 minute)
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy output to .env:
JWT_SECRET=<paste-generated-secret-here>
```

#### C. Email Service - Gmail (10 minutes)
```bash
# 1. Enable 2FA on your Gmail account
# 2. Go to: https://myaccount.google.com/apppasswords
# 3. Generate app password for "Mail"
# 4. Update .env:
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-character app password
```

#### D. Redis - Docker (5 minutes)
```bash
# Start Redis in Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Update .env:
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Step 3: Test Configuration (5 minutes)
```bash
npm run test:production
```

**Expected Output:**
```
✅ CRITICAL SERVICES: READY
✅ RECOMMENDED SERVICES: READY
🎉 PRODUCTION READY!
```

### Step 4: Start Server (1 minute)
```bash
npm start
```

---

## 🔍 Current Status

Run this command to check your configuration:
```bash
npm run test:production
```

### What You Need to Fix:

Based on the test results, you need to configure:

1. **❌ MONGODB_URI** - Database connection
2. **❌ JWT_SECRET** - Security token
3. **⚠️ EMAIL** - Password reset & verification
4. **⚠️ REDIS** - Distributed rate limiting

---

## 📝 Detailed Setup Instructions

### 1. MongoDB Setup

**Option A: Use Existing Local MongoDB** (Recommended for testing)
```env
MONGODB_URI=mongodb://localhost:27017/meri-shikayat-prod
```

**Option B: MongoDB Atlas** (Recommended for production)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0 Sandbox)
3. Create database user
4. Whitelist IP address (0.0.0.0/0 for development)
5. Get connection string
6. Update .env

### 2. JWT Secret Setup

```bash
# Generate 64-character secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env
JWT_SECRET=<generated-secret>
```

### 3. Email Service Setup (Gmail)

**Step-by-Step:**
1. Go to Google Account Settings
2. Security → 2-Step Verification → Enable
3. Security → App passwords → Generate
4. Select "Mail" and "Other (Custom name)"
5. Copy 16-character password
6. Update .env:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**Test Email:**
```bash
# Server should log: "Email service is ready"
npm start
```

### 4. Redis Setup

**Option A: Docker** (Easiest)
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

**Option B: Windows**
```powershell
choco install redis-64
redis-server
```

**Option C: Redis Cloud** (Production)
1. Sign up at https://redis.com/try-free/
2. Create database
3. Copy connection details
4. Update .env

**Update .env:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🧪 Testing

### Run Production Readiness Test
```bash
npm run test:production
```

### Test Individual Services

**Test Email:**
```javascript
// Create test-email.js
import { sendPasswordResetOTP } from './src/services/email.service.js';
await sendPasswordResetOTP('test@example.com', '123456', 'Test');
```

**Test Redis:**
```bash
redis-cli ping
# Should return: PONG
```

**Test MongoDB:**
```bash
mongosh "mongodb://localhost:27017/meri-shikayat-prod"
# Should connect successfully
```

---

## ✅ Production Checklist

Before deploying to production:

- [ ] MongoDB configured and accessible
- [ ] JWT_SECRET set (64+ characters)
- [ ] Email service tested (password reset working)
- [ ] Redis connected (rate limiting distributed)
- [ ] NODE_ENV=production
- [ ] CORS_ORIGIN set to production domain
- [ ] All tests passing (`npm run test:production`)
- [ ] Security audit passed (`npm audit`)
- [ ] Backup strategy in place

---

## 🆘 Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB is running
mongosh

# Check connection string format
MONGODB_URI=mongodb://localhost:27017/database-name
```

### Email Not Sending
```bash
# Verify app password (not regular password)
# Check Gmail settings allow less secure apps
# Check server logs for detailed error
```

### Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping

# Check port 6379 is not blocked
netstat -ano | findstr :6379
```

### JWT_SECRET Too Short
```bash
# Must be at least 64 characters
# Generate new one:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📚 Next Steps

After basic setup:

1. **Configure SMS** (Optional)
   - Sign up at https://www.fast2sms.com/
   - Add FAST2SMS_API_KEY to .env

2. **Setup Monitoring** (Recommended)
   - Sentry for error tracking
   - PagerDuty for alerts

3. **Deploy to Production**
   - Follow deployment guide
   - Run final tests
   - Monitor metrics

---

## 🎯 Quick Commands

```bash
# Check configuration status
npm run test:production

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Seed database
npm run seed

# Check for security issues
npm audit
```

---

## 📞 Need Help?

- Review: [Production Launch Plan](./production_launch_plan.md)
- Check: [.env.example](./.env.example) for all variables
- Test: `npm run test:production` for diagnostics

---

**Estimated Setup Time:** 30-60 minutes  
**Production Ready:** After all tests pass ✅
