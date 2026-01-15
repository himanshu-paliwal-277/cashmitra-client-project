# Cashmitra - Deployment Guide

Complete guide for deploying the Cashmitra application to AWS or any cloud provider.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Environment Variables](#environment-variables)
5. [Frontend Deployment](#frontend-deployment)
6. [Backend Deployment](#backend-deployment)
7. [AWS Deployment Guide](#aws-deployment-guide)
8. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
9. [Quick Reference Commands](#quick-reference-commands)

---

## Project Overview

**Tech Stack:**
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + MongoDB
- **File Storage:** Cloudinary
- **Database:** MongoDB Atlas

**Project Structure:**
```
cashmitra-client-project/
├── frontend/          # React application
├── backend/           # Node.js Express API
└── DEPLOYMENT_GUIDE.md
```

---

## Prerequisites

Before deployment, ensure you have:

- **Node.js:** v18.x or higher (recommended: v20.x)
- **npm:** v9.x or higher
- **MongoDB:** Atlas account or self-hosted MongoDB
- **Cloudinary:** Account for file storage
- **Git:** For version control

### Check Node.js Version
```bash
node --version    # Should be v18.x or higher
npm --version     # Should be v9.x or higher
```

### Install Node.js (if not installed)
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from https://nodejs.org/
```

---

## Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cashmitra-client-project
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configurations (see Environment Variables section)

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your API URL

# Start development server
npm run dev
```

### 4. Access the Application
- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:5000

---

## Environment Variables

### Backend (.env)

Create `backend/.env` with the following variables:

```env
# ===========================================
# SERVER CONFIGURATION
# ===========================================
PORT=5000
NODE_ENV=production

# ===========================================
# DATABASE (MongoDB)
# ===========================================
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# ===========================================
# JWT AUTHENTICATION
# ===========================================
# IMPORTANT: Use a strong, unique secret in production
JWT_SECRET=your_very_strong_secret_key_here_change_this
JWT_EXPIRES_IN=7d

# ===========================================
# CLOUDINARY (File Upload)
# ===========================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ===========================================
# EMAIL CONFIGURATION (Nodemailer)
# ===========================================
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
ADMIN_EMAIL=admin@yourdomain.com

# ===========================================
# MAPS & GEOCODING (Optional)
# ===========================================
GEOCODING_PROVIDER=nominatim
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Frontend (.env)

Create `frontend/.env` with the following variables:

```env
# API URL - Point to your backend server
# Development
VITE_API_URL=http://localhost:5000/api/v1

# Production (example)
# VITE_API_URL=https://api.yourdomain.com/api/v1
```

---

## Frontend Deployment

### Build for Production

```bash
cd frontend

# Install dependencies (if not done)
npm install

# Create production build
npm run build
```

This creates a `dist/` folder with optimized static files.

### Important: SPA Routing Configuration

**Why opening index.html directly doesn't work:**

React applications are Single Page Applications (SPA). They require a web server to handle routing properly. Opening `index.html` directly in a browser won't work because:

1. The browser uses `file://` protocol instead of `http://`
2. JavaScript modules require proper CORS headers
3. Client-side routing needs server-side fallback to `index.html`

### Deployment Options

#### Option 1: AWS S3 + CloudFront (Recommended)

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://your-bucket-name
   ```

2. **Enable Static Website Hosting:**
   - Go to S3 bucket → Properties → Static website hosting
   - Enable it
   - Set Index document: `index.html`
   - Set Error document: `index.html` (important for SPA routing)

3. **Upload Build Files:**
   ```bash
   cd frontend
   npm run build
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Configure CloudFront:**
   - Create a CloudFront distribution
   - Set origin to your S3 bucket
   - Configure error pages: 403 and 404 should return `/index.html` with 200 status

5. **S3 Bucket Policy (for CloudFront):**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowCloudFrontAccess",
         "Effect": "Allow",
         "Principal": {
           "Service": "cloudfront.amazonaws.com"
         },
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

#### Option 2: AWS EC2 with Nginx

1. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

2. **Create Nginx Configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/cashmitra
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/cashmitra/frontend;
       index index.html;

       # Handle SPA routing - redirect all requests to index.html
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
   }
   ```

3. **Enable the Site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/cashmitra /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Upload Files:**
   ```bash
   # On your local machine
   scp -r frontend/dist/* user@your-server:/var/www/cashmitra/frontend/
   ```

#### Option 3: AWS Amplify (Easiest)

1. Connect your GitHub repository to AWS Amplify
2. Amplify auto-detects Vite configuration
3. Add build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   ```

---

## Backend Deployment

### Prepare for Production

```bash
cd backend

# Install dependencies
npm install

# Run linting
npm run lint:fix
```

### Deployment Options

#### Option 1: AWS EC2

1. **Launch EC2 Instance:**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t2.micro (free tier) or t2.small
   - Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Connect to Instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

3. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

4. **Install PM2 (Process Manager):**
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone and Setup:**
   ```bash
   cd /var/www
   sudo git clone <repository-url> cashmitra
   cd cashmitra/backend
   sudo npm install
   ```

6. **Create .env File:**
   ```bash
   sudo nano .env
   # Add all environment variables from the template above
   ```

7. **Start with PM2:**
   ```bash
   pm2 start src/server.js --name cashmitra-api
   pm2 save
   pm2 startup
   ```

8. **Setup Nginx as Reverse Proxy:**
   ```bash
   sudo nano /etc/nginx/sites-available/cashmitra-api
   ```

   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/cashmitra-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### Option 2: AWS Elastic Beanstalk

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB:**
   ```bash
   cd backend
   eb init
   ```

3. **Create Environment:**
   ```bash
   eb create cashmitra-api-prod
   ```

4. **Set Environment Variables:**
   ```bash
   eb setenv PORT=8080 NODE_ENV=production MONGODB_URI="your-uri" JWT_SECRET="your-secret"
   ```

5. **Deploy:**
   ```bash
   eb deploy
   ```

#### Option 3: Docker Deployment

1. **Create Dockerfile in backend/:**
   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .

   EXPOSE 5000

   CMD ["node", "src/server.js"]
   ```

2. **Build and Run:**
   ```bash
   docker build -t cashmitra-api .
   docker run -d -p 5000:5000 --env-file .env cashmitra-api
   ```

---

## AWS Deployment Guide

### Complete AWS Architecture

```
                    ┌─────────────────┐
                    │   CloudFront    │
                    │   (CDN + SSL)   │
                    └────────┬────────┘
                             │
           ┌─────────────────┴─────────────────┐
           │                                   │
    ┌──────▼──────┐                    ┌───────▼───────┐
    │  S3 Bucket  │                    │   EC2 / EBS   │
    │  (Frontend) │                    │   (Backend)   │
    └─────────────┘                    └───────┬───────┘
                                               │
                                       ┌───────▼───────┐
                                       │ MongoDB Atlas │
                                       └───────────────┘
```

### Step-by-Step AWS Deployment

#### 1. Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist your EC2 IP (or allow all IPs: 0.0.0.0/0)
5. Get connection string

#### 2. Setup Cloudinary

1. Go to [Cloudinary](https://cloudinary.com)
2. Create free account
3. Get Cloud Name, API Key, and API Secret from Dashboard

#### 3. Deploy Backend to EC2

```bash
# 1. Launch EC2 (Ubuntu 22.04, t2.small recommended)

# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 3. Update system
sudo apt update && sudo apt upgrade -y

# 4. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 5. Install Nginx and PM2
sudo apt install -y nginx
sudo npm install -g pm2

# 6. Clone repository
cd /var/www
sudo git clone <your-repo-url> cashmitra
sudo chown -R ubuntu:ubuntu cashmitra

# 7. Setup backend
cd cashmitra/backend
npm install

# 8. Create .env file
nano .env
# Paste your environment variables

# 9. Start application
pm2 start src/server.js --name cashmitra-api
pm2 save
pm2 startup

# 10. Configure Nginx (see Backend Deployment section)

# 11. Setup SSL with Certbot
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

#### 4. Deploy Frontend to S3 + CloudFront

```bash
# On your local machine

# 1. Update frontend .env with production API URL
cd frontend
echo "VITE_API_URL=https://api.yourdomain.com/api/v1" > .env

# 2. Build
npm run build

# 3. Create S3 bucket
aws s3 mb s3://cashmitra-frontend

# 4. Upload files
aws s3 sync dist/ s3://cashmitra-frontend --delete

# 5. Configure S3 for static hosting via AWS Console
# - Enable static website hosting
# - Set index.html as index and error document

# 6. Create CloudFront distribution
# - Origin: S3 bucket
# - Configure custom error responses for SPA routing
```

---

## Common Issues & Troubleshooting

### Issue 1: Blank Page When Opening index.html Directly

**Cause:** React SPAs cannot run directly from the file system.

**Solution:** Always serve through a web server:
```bash
# For local testing after build
cd frontend
npm run preview
# Access at http://localhost:4173
```

### Issue 2: API Calls Failing in Production

**Cause:** Incorrect API URL or CORS issues.

**Solution:**
1. Verify `VITE_API_URL` in frontend `.env` before building
2. Ensure backend CORS allows your frontend domain
3. Check backend is running and accessible

### Issue 3: 404 Errors on Page Refresh

**Cause:** Server not configured for SPA routing.

**Solution:** Configure server to return `index.html` for all routes:

**Nginx:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**S3 + CloudFront:**
- Set error document to `index.html`
- Configure CloudFront custom error responses

### Issue 4: MongoDB Connection Failed

**Cause:** IP not whitelisted or incorrect connection string.

**Solution:**
1. Whitelist EC2 IP in MongoDB Atlas Network Access
2. Verify connection string format
3. Check username/password are URL-encoded if they contain special characters

### Issue 5: File Uploads Not Working

**Cause:** Cloudinary credentials not configured.

**Solution:**
1. Verify all three Cloudinary env variables are set
2. Check Cloudinary dashboard for API usage

### Issue 6: Environment Variables Not Loading

**Cause:** Variables not available at build time.

**Solution:**
- Frontend: Variables must be prefixed with `VITE_`
- Frontend: Rebuild after changing `.env`
- Backend: Restart server after changing `.env`

---

## Quick Reference Commands

### Frontend Commands
```bash
cd frontend

npm install          # Install dependencies
npm run dev          # Start development server (port 5174)
npm run build        # Create production build
npm run preview      # Preview production build locally
npm run lint         # Run linter
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
```

### Backend Commands
```bash
cd backend

npm install          # Install dependencies
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run lint         # Run linter
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run seed:admin   # Seed admin user
npm run seed:user    # Seed test users
npm run seed:partner # Seed partner data
```

### PM2 Commands (Production)
```bash
pm2 start src/server.js --name cashmitra-api  # Start application
pm2 restart cashmitra-api                      # Restart application
pm2 stop cashmitra-api                         # Stop application
pm2 logs cashmitra-api                         # View logs
pm2 monit                                      # Monitor processes
pm2 save                                       # Save process list
pm2 startup                                    # Generate startup script
```

### Docker Commands
```bash
docker build -t cashmitra-api .               # Build image
docker run -d -p 5000:5000 cashmitra-api      # Run container
docker ps                                      # List running containers
docker logs <container-id>                     # View logs
docker stop <container-id>                     # Stop container
```

### AWS CLI Commands
```bash
# S3
aws s3 sync dist/ s3://bucket-name --delete   # Upload frontend build
aws s3 ls s3://bucket-name                    # List bucket contents

# EC2
aws ec2 describe-instances                    # List instances
```

---

## Security Checklist

Before going to production:

- [ ] Change `JWT_SECRET` to a strong, unique value
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Whitelist only necessary IPs in MongoDB Atlas
- [ ] Use environment variables for all secrets
- [ ] Enable CloudFront/CDN for frontend
- [ ] Setup proper backup for MongoDB
- [ ] Configure rate limiting
- [ ] Setup monitoring and logging

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs: `pm2 logs cashmitra-api`
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

*Last Updated: January 2025*
