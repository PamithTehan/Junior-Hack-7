# Vercel Deployment Guide

This guide will help you deploy the Sri Lankan Nutrition Advisor frontend to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub/GitLab/Bitbucket account (for connecting your repository)
- Backend API deployed and accessible (see Backend Deployment section)

## Frontend Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository
   - Select the repository containing your project

3. **Configure Project Settings**
   - **Root Directory**: Set to `Client/vite-project` (IMPORTANT!)
   - **Framework Preset**: Vite (should auto-detect)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)
   
   **Note**: The `vercel.json` file in the root directory already specifies `rootDirectory: "Client/vite-project"`, so Vercel should automatically detect this. However, you can also set it manually in the Vercel dashboard under Project Settings → General → Root Directory.

4. **Set Environment Variables**
   - Click "Environment Variables"
   - Add the following:
     ```
     VITE_API_URL = https://your-backend-url.com/api
     ```
   - Replace `your-backend-url.com` with your actual backend URL
   - Select all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Frontend Directory**
   ```bash
   cd Client/vite-project
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Set root directory if needed
   - Add environment variables when prompted

5. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_URL
   ```
   - Enter your backend API URL when prompted
   - Select all environments

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Backend Deployment Options

Since Vercel is optimized for frontend and serverless functions, you'll need to deploy your Express backend separately. Here are recommended options:

### Option 1: Railway (Recommended)

1. **Sign up at [railway.app](https://railway.app)**
2. **Create New Project**
3. **Deploy from GitHub**
   - Connect your repository
   - Select the `Server` directory as root
4. **Set Environment Variables**
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
5. **Deploy**
   - Railway will auto-detect Node.js
   - It will run `npm install` and `npm start`
   - Get your backend URL from Railway dashboard

### Option 2: Render

1. **Sign up at [render.com](https://render.com)**
2. **Create New Web Service**
3. **Connect Repository**
   - Select your repository
   - Set root directory to `Server`
4. **Configure**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. **Set Environment Variables** (same as Railway)
6. **Deploy**

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd Server
   heroku create your-app-name
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   # ... set all other variables
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

## Environment Variables Setup

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.railway.app/api` |

### Backend (Railway/Render/Heroku)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |
| `JWT_EXPIRE` | JWT expiration | `30d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `CLIENT_URL` | Frontend URL | `https://your-app.vercel.app` |

## MongoDB Atlas Setup (Production)

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster

2. **Configure Network Access**
   - Add `0.0.0.0/0` to allow all IPs (or specific IPs for security)

3. **Create Database User**
   - Create a user with read/write permissions

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Use this as `MONGODB_URI`

## CORS Configuration

Make sure your backend `CLIENT_URL` environment variable matches your Vercel deployment URL:

```
CLIENT_URL=https://your-project.vercel.app
```

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render/Heroku
- [ ] Environment variables set in both frontend and backend
- [ ] MongoDB Atlas cluster created and connected
- [ ] CORS configured correctly
- [ ] Test authentication flow
- [ ] Test API endpoints
- [ ] Verify image uploads work
- [ ] Check console for errors
- [ ] Test on mobile devices

## Custom Domain (Optional)

### Vercel Custom Domain

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Backend Custom Domain

- **Railway**: Add custom domain in project settings
- **Render**: Add custom domain in service settings
- **Heroku**: Use Heroku SSL or add custom domain

## Troubleshooting

### Build Fails on Vercel

- **"Missing script: build" error**: 
  - This happens when Vercel is trying to build from the root directory instead of `Client/vite-project`
  - **Solution**: Make sure the `rootDirectory` is set to `Client/vite-project` in your Vercel project settings
  - Go to Project Settings → General → Root Directory and set it to `Client/vite-project`
  - The root `vercel.json` file should have `"rootDirectory": "Client/vite-project"` - verify this is committed to your repository
- Check build logs for errors
- Ensure `package.json` has correct build script
- Verify all dependencies are in `package.json`
- Check Node.js version compatibility

### API Calls Fail

- Verify `VITE_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is accessible (not blocked by firewall)
- Check browser console for CORS errors

### Environment Variables Not Working

- Restart deployment after adding variables
- Verify variable names start with `VITE_` for Vite
- Check variable is set for correct environment (Production/Preview)

### Images Not Loading

- Verify Cloudinary credentials
- Check image URLs in database
- Ensure Cloudinary CORS settings allow your domain

## Continuous Deployment

Once connected to GitHub, Vercel will automatically deploy:
- **Production**: Deploys on push to `main` branch
- **Preview**: Deploys on pull requests

## Monitoring

- **Vercel Analytics**: Enable in project settings
- **Error Tracking**: Consider adding Sentry
- **Performance**: Use Vercel Speed Insights

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)

---

**Note**: Remember to update your frontend `VITE_API_URL` environment variable in Vercel whenever you redeploy your backend or change its URL.

