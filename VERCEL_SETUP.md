# Vercel Setup Guide - Step by Step

## 🎯 Complete Vercel Deployment Setup

This guide will walk you through setting up **3 separate Vercel deployments** for dev, UAT, and production environments.

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] MongoDB Atlas account (or MongoDB database URLs)
- [ ] Gmail account with App Password (for emails)
- [ ] Repository pushed to GitHub

---

## 🚀 Step-by-Step Setup

### Step 1: Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "feat: Add Vercel configs and database models"

# Push to all branches
git push origin dev
git push origin uat  # Create if doesn't exist
git push origin main
```

**Create UAT branch if it doesn't exist:**
```bash
git checkout -b uat
git push origin uat
git checkout dev
```

---

### Step 2: Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repositories

---

### Step 3: Create Production Project

#### 3.1 Import Project
1. Click "Add New..." → "Project"
2. Find your repository: `meri-shikayat`
3. Click "Import"

#### 3.2 Configure Project
**Project Settings:**
- **Project Name:** `meri-shikayat-prod`
- **Framework Preset:** Other
- **Root Directory:** `./`
- **Build Command:** Leave empty (we'll use vercel.json)
- **Output Directory:** Leave empty
- **Install Command:** `npm install`

#### 3.3 Configure Git
- **Production Branch:** `main`
- Click "Deploy"

#### 3.4 Add Environment Variables

After deployment, go to Project Settings → Environment Variables:

```
# Production Environment Variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meri-shikayat-prod
JWT_SECRET=your-production-secret-min-32-characters-long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
EMAIL_SERVICE=gmail
EMAIL_USER=production@yourdomain.com
EMAIL_PASSWORD=your-gmail-app-password
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=5
PORT=5000
```

**Important:** Select "Production" for all variables

---

### Step 4: Create UAT Project

#### 4.1 Create New Project
1. Go to Vercel Dashboard
2. Click "Add New..." → "Project"
3. Import same repository again
4. Click "Import"

#### 4.2 Configure Project
**Project Settings:**
- **Project Name:** `meri-shikayat-uat`
- Same settings as production

#### 4.3 Configure Git
- **Production Branch:** `uat`
- Click "Deploy"

#### 4.4 Add Environment Variables

```
# UAT Environment Variables
NODE_ENV=staging
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meri-shikayat-uat
JWT_SECRET=your-uat-secret-different-from-prod
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
EMAIL_SERVICE=gmail
EMAIL_USER=uat@yourdomain.com
EMAIL_PASSWORD=your-gmail-app-password
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=5
PORT=5000
```

---

### Step 5: Create Development Project

#### 5.1 Create New Project
1. Go to Vercel Dashboard
2. Click "Add New..." → "Project"
3. Import same repository again
4. Click "Import"

#### 5.2 Configure Project
**Project Settings:**
- **Project Name:** `meri-shikayat-dev`
- Same settings as production

#### 5.3 Configure Git
- **Production Branch:** `dev`
- Click "Deploy"

#### 5.4 Add Environment Variables

```
# Development Environment Variables
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meri-shikayat-dev
JWT_SECRET=your-dev-secret-can-be-simple
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
EMAIL_SERVICE=gmail
EMAIL_USER=dev@yourdomain.com
EMAIL_PASSWORD=your-gmail-app-password
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=5
PORT=5000
```

---

## 🗄️ MongoDB Atlas Setup

### Create 3 Databases

1. **Login to MongoDB Atlas:** https://cloud.mongodb.com
2. **Go to your cluster**
3. **Create 3 databases:**
   - `meri-shikayat-prod`
   - `meri-shikayat-uat`
   - `meri-shikayat-dev`

### Get Connection Strings

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with environment-specific database name

**Example:**
```
mongodb+srv://username:password@cluster.mongodb.net/meri-shikayat-dev
mongodb+srv://username:password@cluster.mongodb.net/meri-shikayat-uat
mongodb+srv://username:password@cluster.mongodb.net/meri-shikayat-prod
```

### Whitelist Vercel IPs

1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

---

## 📧 Gmail App Password Setup

### For Each Environment

1. **Go to:** https://myaccount.google.com/apppasswords
2. **Select:** Mail
3. **Select:** Other (Custom name)
4. **Name it:** "Meri Shikayat Production" (or Dev/UAT)
5. **Copy** the 16-character password
6. **Add to Vercel** environment variables

---

## 🌱 Seed Database (Optional)

### For Development

```bash
# SSH into your dev environment or run locally
cd server
npm run seed:dev
```

### For UAT

```bash
cd server
npm run seed:uat
```

### For Production
**Do NOT seed production!** Real users only.

---

## ✅ Verification Checklist

### Production
- [ ] Vercel project created: `meri-shikayat-prod`
- [ ] Branch configured: `main`
- [ ] Environment variables added
- [ ] MongoDB database created: `meri-shikayat-prod`
- [ ] Connection string added
- [ ] Gmail app password configured
- [ ] Deployment successful
- [ ] Test URL works

### UAT
- [ ] Vercel project created: `meri-shikayat-uat`
- [ ] Branch configured: `uat`
- [ ] Environment variables added
- [ ] MongoDB database created: `meri-shikayat-uat`
- [ ] Connection string added
- [ ] Gmail app password configured
- [ ] Deployment successful
- [ ] Test URL works
- [ ] Seed data loaded

### Development
- [ ] Vercel project created: `meri-shikayat-dev`
- [ ] Branch configured: `dev`
- [ ] Environment variables added
- [ ] MongoDB database created: `meri-shikayat-dev`
- [ ] Connection string added
- [ ] Gmail app password configured
- [ ] Deployment successful
- [ ] Test URL works
- [ ] Seed data loaded

---

## 🔄 Deployment Workflow

### Automatic Deployments

```bash
# Deploy to Development
git checkout dev
git add .
git commit -m "feat: new feature"
git push origin dev
# → Auto-deploys to meri-shikayat-dev.vercel.app

# Deploy to UAT (after testing in dev)
git checkout uat
git merge dev
git push origin uat
# → Auto-deploys to meri-shikayat-uat.vercel.app

# Deploy to Production (after UAT approval)
git checkout main
git merge uat
git push origin main
# → Auto-deploys to meri-shikayat-prod.vercel.app
```

---

## 🎯 Your Deployment URLs

After setup, you'll have:

- **Production:** https://meri-shikayat-prod.vercel.app
- **UAT:** https://meri-shikayat-uat.vercel.app
- **Development:** https://meri-shikayat-dev.vercel.app

---

## 🐛 Troubleshooting

### Build Fails

**Check:**
1. Vercel build logs
2. `vercel.json` configuration
3. Package.json scripts
4. Node version compatibility

### Database Connection Error

**Check:**
1. MongoDB connection string format
2. Database password (no special characters issues)
3. IP whitelist (0.0.0.0/0)
4. Database name matches environment

### Environment Variables Not Working

**Check:**
1. Variable names are correct
2. No typos in values
3. Redeploy after adding variables
4. Check variable scope (Production/Preview/Development)

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **GitHub Issues:** Create issue in your repository

---

**Setup Complete!** 🎉

You now have 3 separate environments with automatic deployments!
