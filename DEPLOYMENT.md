# Vercel Multi-Environment Deployment Guide

## 🚀 Overview

This project supports deployment to three separate environments:
- **Production** (main branch) → meri-shikayat-prod
- **UAT/Staging** (uat branch) → meri-shikayat-uat  
- **Development** (dev branch) → meri-shikayat-dev

Each environment has its own Vercel configuration file and MongoDB database.

---

## 📋 Setup Instructions

### Step 1: Create Vercel Projects

You need to create **3 separate Vercel projects**:

#### 1. Production Project
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Name: `meri-shikayat-prod`
4. Framework: `Other`
5. Root Directory: `./`
6. Build Command: `cd client && npm install && npm run build`
7. Output Directory: `client/dist`
8. Install Command: `npm install`

**Git Configuration:**
- Production Branch: `main`
- Auto-deploy: ✅ Enabled

#### 2. UAT Project
1. Create new project (same repo)
2. Name: `meri-shikayat-uat`
3. Same settings as production

**Git Configuration:**
- Production Branch: `uat`
- Auto-deploy: ✅ Enabled

#### 3. Development Project
1. Create new project (same repo)
2. Name: `meri-shikayat-dev`
3. Same settings as production

**Git Configuration:**
- Production Branch: `dev`
- Auto-deploy: ✅ Enabled

---

### Step 2: Configure Environment Variables

For **each project**, add these environment variables in Vercel dashboard:

#### Production Environment Variables
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meri-shikayat-prod
JWT_SECRET=your-super-secret-production-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
EMAIL_SERVICE=gmail
EMAIL_USER=production@merishi kayat.com
EMAIL_PASSWORD=your-production-app-password
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=5
PORT=5000
```

#### UAT Environment Variables
```
NODE_ENV=staging
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meri-shikayat-uat
JWT_SECRET=your-uat-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
EMAIL_SERVICE=gmail
EMAIL_USER=uat@merishikayat.com
EMAIL_PASSWORD=your-uat-app-password
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=5
PORT=5000
```

#### Development Environment Variables
```
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meri-shikayat-dev
JWT_SECRET=your-dev-secret-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
EMAIL_SERVICE=gmail
EMAIL_USER=dev@merishikayat.com
EMAIL_PASSWORD=your-dev-app-password
OTP_EXPIRY_MINUTES=5
MAX_OTP_ATTEMPTS=5
PORT=5000
```

---

### Step 3: MongoDB Setup

Create **3 separate MongoDB databases**:

#### Option A: MongoDB Atlas (Recommended)

1. **Create Cluster** (if not exists)
2. **Create 3 Databases:**
   - `meri-shikayat-prod`
   - `meri-shikayat-uat`
   - `meri-shikayat-dev`

3. **Get Connection Strings:**
   - Click "Connect" → "Connect your application"
   - Copy connection string for each database
   - Replace `<password>` and `<dbname>`

#### Option B: Separate Clusters

For better isolation, create 3 separate clusters:
- Production Cluster → `meri-shikayat-prod`
- UAT Cluster → `meri-shikayat-uat`
- Dev Cluster → `meri-shikayat-dev`

---

### Step 4: Deploy

#### Automatic Deployment

Once configured, deployments happen automatically:

```bash
# Deploy to Production
git checkout main
git push origin main
# → Deploys to meri-shikayat-prod.vercel.app

# Deploy to UAT
git checkout uat
git push origin uat
# → Deploys to meri-shikayat-uat.vercel.app

# Deploy to Development
git checkout dev
git push origin dev
# → Deploys to meri-shikayat-dev.vercel.app
```

#### Manual Deployment

Using Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Production
vercel --prod

# Deploy to UAT
vercel --prod --scope=meri-shikayat-uat

# Deploy to Development
vercel --prod --scope=meri-shikayat-dev
```

---

## 🔧 Configuration Files

### vercel.json (Production)
Used when deploying `main` branch to production.

### vercel.dev.json (Development)
Used when deploying `dev` branch to development.

### vercel.uat.json (UAT)
Used when deploying `uat` branch to UAT/staging.

---

## 🌍 Environment URLs

After deployment, you'll get:

- **Production:** https://meri-shikayat-prod.vercel.app
- **UAT:** https://meri-shikayat-uat.vercel.app
- **Development:** https://meri-shikayat-dev.vercel.app

---

## 🔒 Security Best Practices

1. **Different JWT Secrets:** Use unique secrets for each environment
2. **Separate Databases:** Never share databases between environments
3. **Email Accounts:** Use different email accounts or subdomains
4. **API Keys:** Use environment-specific API keys
5. **Access Control:** Limit who can deploy to production

---

## 📊 Monitoring

### Vercel Dashboard

Monitor each deployment:
- Build logs
- Runtime logs
- Analytics
- Performance metrics

### Database Monitoring

Use MongoDB Atlas monitoring:
- Query performance
- Connection stats
- Storage usage
- Alerts

---

## 🐛 Troubleshooting

### Build Failures

**Check:**
1. Build logs in Vercel dashboard
2. Environment variables are set
3. Dependencies are installed
4. Build command is correct

### Runtime Errors

**Check:**
1. Function logs in Vercel
2. MongoDB connection string
3. Environment variables
4. API endpoints

### Database Connection Issues

**Check:**
1. MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for Vercel)
2. Connection string format
3. Database user permissions
4. Network access settings

---

## 📝 Deployment Checklist

### Before First Deployment

- [ ] Create 3 Vercel projects
- [ ] Configure environment variables for each
- [ ] Create 3 MongoDB databases
- [ ] Update connection strings
- [ ] Test local builds
- [ ] Commit all changes

### For Each Deployment

- [ ] Test locally first
- [ ] Update version in README
- [ ] Commit changes
- [ ] Push to correct branch
- [ ] Monitor deployment logs
- [ ] Test deployed application
- [ ] Check database connections
- [ ] Verify environment variables

---

## 🎯 Quick Reference

| Environment | Branch | Vercel Project | Database | Config File |
|------------|--------|---------------|----------|-------------|
| Production | main | meri-shikayat-prod | meri-shikayat-prod | vercel.json |
| UAT | uat | meri-shikayat-uat | meri-shikayat-uat | vercel.uat.json |
| Development | dev | meri-shikayat-dev | meri-shikayat-dev | vercel.dev.json |

---

## 🔄 Workflow Example

```bash
# 1. Develop on dev branch
git checkout dev
# ... make changes ...
git add .
git commit -m "feat: new feature"
git push origin dev
# → Auto-deploys to dev environment

# 2. Test and promote to UAT
git checkout uat
git merge dev
git push origin uat
# → Auto-deploys to UAT environment

# 3. After UAT approval, promote to production
git checkout main
git merge uat
git push origin main
# → Auto-deploys to production environment
```

---

## 📞 Support

For issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check MongoDB Atlas docs: https://docs.atlas.mongodb.com
3. Review deployment logs
4. Contact team lead

---

**Last Updated:** December 5, 2025
**Version:** 1.0
