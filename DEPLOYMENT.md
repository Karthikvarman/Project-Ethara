# Ethara Inventory System - Deployment Guide

This guide walks you through deploying the Ethara Inventory Management System to free hosting platforms.

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Vercel (Frontend)                      │
│        https://ethara.vercel.app (React + Vite)         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS API calls
┌────────────────────▼────────────────────────────────────┐
│                  Render (Backend)                       │
│      https://ethara-backend.onrender.com                │
│              (FastAPI + PostgreSQL)                     │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- GitHub account with the project pushed
- Vercel account (free) - https://vercel.com
- Render account (free) - https://render.com

## Step 1: Deploy Backend to Render

### 1.1 Create a Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Grant permission to access your repositories

### 1.2 Deploy Backend + Database

1. Click **"New +"** → **"Web Service"**
2. Select repository: `Project-Ethara`
3. Configure:
   - **Name**: `ethara-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

4. Add Environment Variables:
   - `PYTHONUNBUFFERED`: `1`
   - `BACKEND_CORS_ORIGINS`: Leave blank for now (we'll update after frontend deployment)

5. Click **"Create Web Service"**
6. Wait for deployment (takes 2-3 minutes)
7. Note your backend URL: `https://ethara-backend.onrender.com` (will be shown after deployment)

### 1.3 Add PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `ethara-db`
   - **Database**: `ethara`
   - **User**: `ethara`
   - **Region**: Choose closest to you
   - **Plan**: `Free`

3. Click **"Create Database"**
4. Copy the **Internal Database URL** (provided in database details)
5. Add to your backend service environment variables:
   - `DATABASE_URL`: Paste the internal database URL

6. Redeploy backend service (click **"Manual Deploy"**)

**Backend will now be live at**: `https://ethara-backend.onrender.com`

## Step 2: Deploy Frontend to Vercel

### 2.1 Create a Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Grant permission to access your repositories

### 2.2 Deploy Frontend

1. Click **"Add New..."** → **"Project"**
2. Import repository: `Project-Ethara`
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://ethara-backend.onrender.com` (your backend URL from Step 1.2)

5. Click **"Deploy"**
6. Wait for deployment (takes 1-2 minutes)

**Frontend will now be live at**: `https://project-ethara.vercel.app` (or similar)

## Step 3: Update CORS Configuration

### 3.1 Update Backend CORS

1. Go to Render dashboard
2. Select the `ethara-backend` service
3. Go to **Environment**
4. Update `BACKEND_CORS_ORIGINS`:
   ```
   https://project-ethara.vercel.app,https://ethara-backend.onrender.com
   ```
   (Use the exact URL from your Vercel deployment)

5. Click **"Save"** and **"Manual Deploy"**

## Step 4: Test the Deployment

1. Open your frontend URL: `https://project-ethara.vercel.app`
2. Test creating products, customers, and orders
3. Check backend health: `https://ethara-backend.onrender.com/health` (should return `{"status":"ok"}`)
4. View API docs: `https://ethara-backend.onrender.com/docs`

## Public URLs

After deployment, your application will be accessible at:

- **Frontend**: `https://project-ethara.vercel.app`
- **Backend API**: `https://ethara-backend.onrender.com`
- **API Documentation**: `https://ethara-backend.onrender.com/docs`
- **Database**: Managed by Render (not publicly exposed)

## Important Notes

### Free Tier Limitations

1. **Render**: Free services spin down after 15 minutes of inactivity (will restart when accessed)
2. **Vercel**: No inactivity restrictions
3. **Database**: Render free PostgreSQL has 256MB storage

### Production Considerations

When ready to move to production:
1. Use Render's paid tiers to avoid spin-down delays
2. Configure custom domains
3. Set up automated backups
4. Monitor uptime and performance
5. Implement proper error logging and monitoring

## Troubleshooting

### Backend won't connect to database
- Verify DATABASE_URL is set correctly
- Check Render database credentials
- Ensure backend service has the correct environment variable

### Frontend can't reach backend
- Verify VITE_API_BASE_URL is correct in Vercel
- Check BACKEND_CORS_ORIGINS in Render
- Open browser DevTools → Network tab to see API calls

### Deployment fails
- Check build logs in Render/Vercel dashboard
- Verify all files are committed to GitHub
- Ensure requirements.txt and package.json are up to date

## Updating Your Deployment

To update the deployed application:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Vercel and Render will automatically redeploy

## Next Steps

1. Consider setting up monitoring (Datadog, New Relic, etc.)
2. Add logging for production debugging
3. Implement backup strategy for database
4. Set up uptime monitoring
5. Custom domain configuration for professional appearance
