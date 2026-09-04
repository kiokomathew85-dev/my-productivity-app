# Deployment Guide

This guide provides instructions for deploying the Productivity App to production environments.

## Backend Deployment Options

### Option 1: Deploy on Render

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create a new Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `productivity-api`
     - Runtime: `Python 3.11`
     - Build Command: `pip install -r backend/requirements.txt`
     - Start Command: `gunicorn backend.app:app`

3. **Set Environment Variables in Render**
   - Add the following in the Environment section:
     ```
     FLASK_ENV=production
     SECRET_KEY=<generate-a-random-string>
     JWT_SECRET_KEY=<generate-another-random-string>
     DATABASE_URL=<your-postgres-url>
     ```

4. **Add PostgreSQL Database**
   - In Render, create a new PostgreSQL database
   - Use the provided DATABASE_URL

5. **Deploy**
   - Render will automatically deploy on git push
   - Your API will be available at: `https://productivity-api.onrender.com`

### Option 2: Deploy on Heroku

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   # or download from heroku.com for Windows
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

4. **Add PostgreSQL Add-on**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set JWT_SECRET_KEY=your-jwt-secret
   heroku config:set FLASK_ENV=production
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: Deploy with Docker

1. **Create Dockerfile in backend directory**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["gunicorn", "app:app"]
   ```

2. **Deploy to Docker service** (AWS ECR, Google Cloud Run, etc.)

## Frontend Deployment Options

### Option 1: Deploy on Netlify

1. **Build the app**
   ```bash
   cd frontend
   npm run build
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `build`

3. **Set Environment Variables**
   - In Netlify settings → "Build & deploy" → "Environment"
   - Add: `REACT_APP_API_URL=<your-backend-url>/api`

4. **Deploy**
   - Netlify automatically deploys on git push

### Option 2: Deploy on Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add new..." → "Project"
   - Import your GitHub repository
   - Select frontend folder as root
   - Build settings:
     - Framework: `Create React App`
     - Build command: `npm run build`
     - Output directory: `build`

3. **Set Environment Variables**
   - Add: `REACT_APP_API_URL=<your-backend-url>/api`

4. **Deploy**
   - Vercel automatically deploys on git push

### Option 3: Deploy on AWS S3 + CloudFront

1. **Build the app**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 bucket**
   - Upload `build` folder contents to S3
   - Enable static website hosting
   - Make bucket public

3. **Configure CloudFront**
   - Create CloudFront distribution pointing to S3
   - Configure CORS for API requests

## Database Setup

### PostgreSQL on Cloud

**Render PostgreSQL:**
- Automatically provided when you create a PostgreSQL database
- Connection string available in dashboard

**AWS RDS:**
1. Create RDS PostgreSQL instance
2. Get connection string: `postgresql://user:password@host:5432/dbname`
3. Add to backend environment variables

**Supabase:**
1. Create project at [supabase.com](https://supabase.com)
2. Get PostgreSQL connection string
3. Use in DATABASE_URL

## Production Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Change `JWT_SECRET_KEY` to a strong random value
- [ ] Set `FLASK_ENV=production`
- [ ] Use PostgreSQL (not SQLite) for production
- [ ] Enable HTTPS
- [ ] Configure CORS properly in Flask
- [ ] Set appropriate JWT token expiration
- [ ] Enable logging and monitoring
- [ ] Set up automated backups for database
- [ ] Test all authentication flows
- [ ] Verify data ownership enforcement
- [ ] Load test the application
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CDN for static assets (frontend)

## Post-Deployment

1. **Test the deployed app**
   - Visit frontend URL
   - Test signup flow
   - Test login flow
   - Test CRUD operations
   - Verify data is only visible to owner

2. **Monitor application**
   - Set up error alerts
   - Monitor API response times
   - Track database performance
   - Monitor disk space and memory

3. **Scale if needed**
   - Upgrade backend dyno size
   - Add CDN for frontend assets
   - Implement caching strategies
   - Consider database read replicas

## Troubleshooting

**CORS errors:** Ensure backend FLASK_CORS configuration matches frontend URL

**Database connection:** Verify DATABASE_URL is correct and database is accessible

**Token issues:** Check JWT_SECRET_KEY matches between environments

**Static files not loading:** Verify frontend build directory is correctly configured

For more help, check official documentation:
- Render: https://render.com/docs
- Netlify: https://docs.netlify.com
- Vercel: https://vercel.com/docs
- Heroku: https://devcenter.heroku.com
