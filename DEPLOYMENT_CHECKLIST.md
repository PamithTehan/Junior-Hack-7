# Deployment Checklist

Use this checklist to ensure everything is set up correctly before deploying.

## Pre-Deployment

### Frontend (Vercel)
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] `vercel.json` file created in `Client/vite-project/`
- [ ] `.vercelignore` file created
- [ ] `vite.config.js` updated with build optimizations
- [ ] Environment variables documented in `.env.example`

### Backend (Railway/Render/Heroku)
- [ ] `Procfile` created (for Heroku)
- [ ] `package.json` has `start` script
- [ ] Environment variables documented in `Server/.env.example`
- [ ] MongoDB Atlas cluster created
- [ ] Cloudinary account set up

## Environment Variables

### Frontend (Vercel)
- [ ] `VITE_API_URL` - Backend API URL

### Backend
- [ ] `PORT` - Server port (usually auto-set by platform)
- [ ] `NODE_ENV` - Set to `production`
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Strong random secret key
- [ ] `JWT_EXPIRE` - Token expiration (e.g., `30d`)
- [ ] `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary API secret
- [ ] `CLIENT_URL` - Frontend Vercel URL

## Deployment Steps

### 1. Deploy Backend First
- [ ] Choose platform (Railway/Render/Heroku)
- [ ] Connect repository
- [ ] Set root directory to `Server`
- [ ] Add all environment variables
- [ ] Deploy and get backend URL
- [ ] Test backend health endpoint: `https://your-backend.com/api/health`

### 2. Deploy Frontend
- [ ] Import project to Vercel
- [ ] Set root directory to `Client/vite-project`
- [ ] Add `VITE_API_URL` environment variable (use backend URL from step 1)
- [ ] Deploy
- [ ] Get frontend URL

### 3. Update Backend CORS
- [ ] Update `CLIENT_URL` in backend environment variables
- [ ] Use frontend Vercel URL
- [ ] Redeploy backend if needed

### 4. Database Setup
- [ ] Run seed script on production database (if needed)
- [ ] Verify database connection
- [ ] Test CRUD operations

## Post-Deployment Testing

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are stored correctly
- [ ] Protected routes redirect to login
- [ ] Logout works

### Food Database
- [ ] Food items load correctly
- [ ] Search functionality works
- [ ] Filtering works
- [ ] Pagination works

### Meal Planning
- [ ] Meal plan generation works
- [ ] Meal plans display correctly
- [ ] Nutrition calculations are accurate

### Food Tracking
- [ ] Add food to intake works
- [ ] Remove food from intake works
- [ ] Daily summary displays correctly
- [ ] Date selection works

### Image Upload
- [ ] Image upload works
- [ ] Images display correctly
- [ ] Cloudinary integration works

### General
- [ ] No console errors
- [ ] No CORS errors
- [ ] Responsive design works on mobile
- [ ] All API endpoints respond correctly
- [ ] Error handling works

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB connection string is secure
- [ ] Environment variables are not committed to git
- [ ] CORS is configured correctly
- [ ] API endpoints are protected where needed
- [ ] Passwords are hashed (BCrypt)
- [ ] HTTPS is enabled (automatic on Vercel)

## Performance

- [ ] Build completes successfully
- [ ] Build time is reasonable (< 5 minutes)
- [ ] Page load time is acceptable
- [ ] Images are optimized
- [ ] Code splitting is working (check Network tab)

## Monitoring

- [ ] Error tracking set up (optional: Sentry)
- [ ] Analytics enabled (Vercel Analytics)
- [ ] Logs are accessible
- [ ] Health check endpoint works

## Documentation

- [ ] README.md is up to date
- [ ] VERCEL_DEPLOYMENT.md is complete
- [ ] Environment variables are documented
- [ ] API endpoints are documented

## Rollback Plan

- [ ] Know how to rollback frontend (Vercel dashboard)
- [ ] Know how to rollback backend (platform dashboard)
- [ ] Have previous working version tagged in git
- [ ] Database backups are available

---

**Last Updated**: After completing deployment, update this checklist with any issues encountered and their solutions.

