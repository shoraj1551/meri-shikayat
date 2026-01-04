# 🚀 Vercel Deployment Checklist

**Track your progress through the deployment process**

---

## 📊 Progress Overview

- [ ] **Phase 1:** Account Setup (15 min)
- [ ] **Phase 2:** Service Configuration (45 min)
- [ ] **Phase 3:** Environment Variables (30 min)
- [ ] **Phase 4:** Deployment (15 min)
- [ ] **Phase 5:** Verification (15 min)

**Total Time:** ~2 hours

---

## Phase 1: Account Setup ✅

### Vercel Account
- [ ] Sign up at https://vercel.com/signup
- [ ] Connect GitHub account
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login to CLI: `vercel login`
- [ ] Import project from GitHub

### Notes:
```
Vercel Username: _______________
Project Name: meri-shikayat
```

---

## Phase 2: Service Configuration ✅

### MongoDB Atlas (Database)
- [ ] Sign up at https://www.mongodb.com/cloud/atlas/register
- [ ] Create organization: "Meri Shikayat"
- [ ] Create project: "meri-shikayat-production"
- [ ] Create M0 Sandbox cluster (FREE)
- [ ] Create database user
- [ ] Set username: `meri-shikayat-admin`
- [ ] Generate & save password: `_______________`
- [ ] Add IP whitelist: `0.0.0.0/0`
- [ ] Get connection string
- [ ] Replace password in connection string
- [ ] Add database name: `/meri-shikayat-prod`

**Connection String:**
```
mongodb+srv://meri-shikayat-admin:PASSWORD@cluster.mongodb.net/meri-shikayat-prod?retryWrites=true&w=majority
```

### Redis Cloud (Caching)
- [ ] Sign up at https://redis.com/try-free/
- [ ] Create subscription (Fixed/FREE plan)
- [ ] Create database: "meri-shikayat-cache"
- [ ] Wait for provisioning (2-3 min)
- [ ] Copy endpoint: `_______________`
- [ ] Copy port: `_______________`
- [ ] Copy password: `_______________`

**Connection Details:**
```
Host: redis-xxxxx.cloud.redislabs.com
Port: xxxxx
Password: _______________
```

### Gmail App Password (Email)
- [ ] Go to https://myaccount.google.com/security
- [ ] Enable 2-Factor Authentication
- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Generate app password for "Mail"
- [ ] Name: "Meri Shikayat Production"
- [ ] Copy 16-character password: `____ ____ ____ ____`

**Email Configuration:**
```
Email: _______________@gmail.com
App Password: ____ ____ ____ ____
```

---

## Phase 3: Generate Secrets ✅

### JWT Secret
- [ ] Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Copy output (128 characters)

**JWT_SECRET:**
```
_______________________________________________
```

### Session Secret
- [ ] Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Copy output (128 characters)

**SESSION_SECRET:**
```
_______________________________________________
```

---

## Phase 4: Vercel Environment Variables ✅

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

### Critical Variables (Required)

- [ ] **MONGODB_URI**
  - Value: (Paste MongoDB connection string from Phase 2)
  - Environments: ✅ Production, ✅ Preview, ✅ Development

- [ ] **JWT_SECRET**
  - Value: (Paste 128-char secret from Phase 3)
  - Environments: ✅ Production, ✅ Preview, ✅ Development

- [ ] **NODE_ENV**
  - Value: `production`
  - Environments: ✅ Production only

- [ ] **JWT_ACCESS_EXPIRY**
  - Value: `15m`
  - Environments: ✅ Production, ✅ Preview, ✅ Development

- [ ] **JWT_REFRESH_EXPIRY**
  - Value: `7d`
  - Environments: ✅ Production, ✅ Preview, ✅ Development

### Email Configuration

- [ ] **EMAIL_SERVICE**
  - Value: `gmail`
  - Environments: ✅ Production, ✅ Preview, ✅ Development

- [ ] **EMAIL_USER**
  - Value: (Your Gmail address)
  - Environments: ✅ Production, ✅ Preview, ✅ Development

- [ ] **EMAIL_PASSWORD**
  - Value: (16-char app password from Phase 2)
  - Environments: ✅ Production, ✅ Preview, ✅ Development

### Redis Configuration

- [ ] **REDIS_HOST**
  - Value: (Redis endpoint from Phase 2)
  - Environments: ✅ Production, ✅ Preview, ✅ Development

- [ ] **REDIS_PORT**
  - Value: (Redis port from Phase 2)
  - Environments: ✅ Production, ✅ Preview, ✅ Development

- [ ] **REDIS_PASSWORD**
  - Value: (Redis password from Phase 2)
  - Environments: ✅ Production, ✅ Preview, ✅ Development

- [ ] **REDIS_DB**
  - Value: `0`
  - Environments: ✅ Production, ✅ Preview, ✅ Development

### Security Configuration

- [ ] **SESSION_SECRET**
  - Value: (128-char secret from Phase 3)
  - Environments: ✅ Production, ✅ Preview, ✅ Development

- [ ] **CORS_ORIGIN**
  - Value: `https://your-frontend-url.vercel.app`
  - Environments: ✅ Production
  - **Note:** Update after frontend deployment

### OTP Configuration

- [ ] **OTP_EXPIRY_MINUTES**
  - Value: `5`
  - Environments: ✅ Production, ✅ Preview, ✅ Development

- [ ] **OTP_LENGTH**
  - Value: `6`
  - Environments: ✅ Production, ✅ Preview, ✅ Development

### Optional Variables

- [ ] **FAST2SMS_API_KEY** (Optional - SMS)
  - Value: (Your Fast2SMS API key)
  - Environments: ✅ Production

- [ ] **SENTRY_DSN** (Optional - Error tracking)
  - Value: (Your Sentry DSN)
  - Environments: ✅ Production

- [ ] **SENTRY_ENABLED** (Optional)
  - Value: `true`
  - Environments: ✅ Production

**Total Variables Added:** ___/19

---

## Phase 5: Deployment ✅

### Backend Deployment

- [ ] Go to Vercel Dashboard
- [ ] Click "Deployments" tab
- [ ] Click "Deploy" or push to GitHub main branch
- [ ] Monitor build logs
- [ ] Wait for "Ready" status (2-5 min)
- [ ] Copy deployment URL: `_______________`

**Backend URL:**
```
https://_______________
```

### Frontend Deployment

- [ ] Update API URL in `client/index.html`
- [ ] Set: `window.API_BASE_URL = 'https://your-backend-url.vercel.app/api'`
- [ ] Deploy frontend: `cd client && vercel --prod`
- [ ] Copy deployment URL: `_______________`

**Frontend URL:**
```
https://_______________
```

### Update CORS

- [ ] Go back to Vercel environment variables
- [ ] Update `CORS_ORIGIN` to frontend URL
- [ ] Redeploy backend

---

## Phase 6: Verification ✅

### Backend Health Check

- [ ] Test health endpoint:
  ```bash
  curl https://your-backend-url.vercel.app/api/v1/health
  ```
- [ ] Verify response shows "healthy"
- [ ] Check database: "connected"
- [ ] Check redis: "connected"

### Categories Endpoint

- [ ] Test categories:
  ```bash
  curl https://your-backend-url.vercel.app/api/v1/categories
  ```
- [ ] Verify 9 categories returned

### Frontend Testing

- [ ] Open frontend URL in browser
- [ ] Home page loads ✅
- [ ] Navigate to registration
- [ ] Fill registration form
- [ ] Submit registration
- [ ] Check email for OTP
- [ ] Verify email with OTP
- [ ] Login with credentials
- [ ] Dashboard loads ✅
- [ ] Submit test complaint
- [ ] Verify complaint created

### Monitoring

- [ ] Check Vercel deployment logs
- [ ] No errors in build logs
- [ ] No errors in function logs
- [ ] Database connections successful
- [ ] Redis connections successful
- [ ] Email delivery working

---

## Phase 7: Post-Deployment ✅

### Seed Database (Optional)

- [ ] Seed categories: `npm run seed`
- [ ] Verify categories in database

### Custom Domain (Optional)

- [ ] Go to Project Settings → Domains
- [ ] Add custom domain
- [ ] Configure DNS
- [ ] Update CORS_ORIGIN

### Monitoring Setup

- [ ] Enable Vercel Analytics
- [ ] Configure Sentry (optional)
- [ ] Setup uptime monitoring

---

## 🎯 Final Checklist

- [ ] All environment variables configured
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Health check passing
- [ ] Database connected
- [ ] Redis connected
- [ ] Email service working
- [ ] User registration tested
- [ ] Login tested
- [ ] Complaint submission tested
- [ ] No errors in logs
- [ ] CORS configured correctly
- [ ] Custom domain configured (optional)
- [ ] Monitoring enabled

---

## 📝 Deployment Information

**Deployment Date:** _______________

**URLs:**
- Backend: _______________
- Frontend: _______________
- Custom Domain: _______________

**Database:**
- MongoDB Cluster: _______________
- Redis Instance: _______________

**Status:** 
- [ ] In Progress
- [ ] Deployed
- [ ] Verified
- [ ] Live

---

## 🆘 Quick Troubleshooting

### Build Fails
1. Check Vercel build logs
2. Verify vercel.json configuration
3. Check package.json dependencies

### Database Connection Error
1. Verify MONGODB_URI format
2. Check MongoDB Atlas IP whitelist (0.0.0.0/0)
3. Verify database user credentials

### Redis Connection Error
1. Verify REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
2. Check Redis Cloud database status
3. Test connection locally first

### Email Not Sending
1. Verify EMAIL_USER and EMAIL_PASSWORD
2. Check Gmail app password (not regular password)
3. Verify 2FA enabled on Gmail

### CORS Errors
1. Verify CORS_ORIGIN matches frontend URL exactly
2. Include https:// protocol
3. No trailing slash
4. Redeploy after changing

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **Redis Cloud:** https://docs.redis.com/latest/rc/
- **Deployment Guide:** See vercel_deployment_guide.md

---

**Checklist Version:** 1.0  
**Last Updated:** January 4, 2026  
**Status:** Ready for Deployment
