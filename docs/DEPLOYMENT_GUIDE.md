# AgentX Deployment Guide

This guide covers deploying the AgentX application to various platforms and environments.

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments and optimizations.

#### Prerequisites
- Vercel account
- MongoDB Atlas database
- Cloudinary account

#### Steps

1. **Prepare your repository**
   \`\`\`bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the AgentX project

3. **Configure Environment Variables**
   In your Vercel dashboard, add these environment variables:
   \`\`\`
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agentx
   JWT_SECRET=your-production-jwt-secret-here
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
   \`\`\`

4. **Deploy**
   - Click "Deploy" in Vercel
   - Wait for the build to complete
   - Your app will be available at `https://your-app.vercel.app`

#### Vercel Configuration

Create a `vercel.json` file in your root directory:

\`\`\`json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "JWT_SECRET": "@jwt-secret",
    "CLOUDINARY_CLOUD_NAME": "@cloudinary-cloud-name",
    "CLOUDINARY_API_KEY": "@cloudinary-api-key",
    "CLOUDINARY_API_SECRET": "@cloudinary-api-secret"
  }
}
\`\`\`

### 2. Railway

Railway offers a simple deployment experience with built-in database options.

#### Steps

1. **Install Railway CLI**
   \`\`\`bash
   npm install -g @railway/cli
   \`\`\`

2. **Login and Initialize**
   \`\`\`bash
   railway login
   railway init
   \`\`\`

3. **Add Environment Variables**
   \`\`\`bash
   railway variables set MONGODB_URI=your-mongodb-uri
   railway variables set JWT_SECRET=your-jwt-secret
   railway variables set CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   railway variables set CLOUDINARY_API_KEY=your-cloudinary-key
   railway variables set CLOUDINARY_API_SECRET=your-cloudinary-secret
   \`\`\`

4. **Deploy**
   \`\`\`bash
   railway up
   \`\`\`

### 3. DigitalOcean App Platform

#### Steps

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Select the AgentX repository

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Environment: Node.js

3. **Set Environment Variables**
   Add all required environment variables in the App Platform dashboard

4. **Deploy**
   Click "Create App" to deploy

### 4. Self-Hosted (VPS/Dedicated Server)

#### Prerequisites
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- MongoDB
- Nginx (optional, for reverse proxy)
- PM2 (for process management)

#### Steps

1. **Server Setup**
   \`\`\`bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx (optional)
   sudo apt install nginx
   \`\`\`

2. **MongoDB Setup**
   \`\`\`bash
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   \`\`\`

3. **Deploy Application**
   \`\`\`bash
   # Clone repository
   git clone <your-repository-url>
   cd agentx
   
   # Install dependencies
   npm install
   
   # Create environment file
   cp .env.example .env.local
   # Edit .env.local with your production values
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "agentx" -- start
   pm2 save
   pm2 startup
   \`\`\`

4. **Nginx Configuration** (Optional)
   \`\`\`nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
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
   \`\`\`

## Database Setup

### MongoDB Atlas (Cloud)

1. **Create Cluster**
   - Visit [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster
   - Choose your preferred region

2. **Configure Access**
   - Add your IP address to the whitelist
   - Create a database user
   - Get your connection string

3. **Connection String Format**
   \`\`\`
   mongodb+srv://username:password@cluster.mongodb.net/agentx?retryWrites=true&w=majority
   \`\`\`

### Local MongoDB

1. **Install MongoDB**
   Follow the official MongoDB installation guide for your operating system

2. **Create Database**
   \`\`\`bash
   mongosh
   use agentx
   \`\`\`

3. **Connection String**
   \`\`\`
   mongodb://localhost:27017/agentx
   \`\`\`

## Environment Variables

### Production Environment Variables

\`\`\`env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/agentx

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com/api
\`\`\`

### Security Considerations

1. **JWT Secret**
   - Use a strong, random string (minimum 32 characters)
   - Never commit secrets to version control
   - Rotate secrets regularly

2. **Database Security**
   - Use MongoDB Atlas with IP whitelisting
   - Create dedicated database users with minimal permissions
   - Enable authentication and SSL

3. **API Security**
   - Implement rate limiting
   - Use HTTPS in production
   - Validate all inputs
   - Sanitize user data

## Performance Optimization

### Next.js Optimizations

1. **Build Optimization**
   \`\`\`javascript
   // next.config.mjs
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     experimental: {
       optimizeCss: true,
     },
     compress: true,
     poweredByHeader: false,
     generateEtags: false,
   }
   
   export default nextConfig
   \`\`\`

2. **Image Optimization**
   - Use Next.js Image component
   - Optimize images before upload
   - Use appropriate image formats (WebP, AVIF)

3. **Bundle Analysis**
   \`\`\`bash
   npm install --save-dev @next/bundle-analyzer
   \`\`\`

### Database Optimization

1. **Indexing**
   \`\`\`javascript
   // Add indexes for frequently queried fields
   db.agents.createIndex({ email: 1 })
   db.tasks.createIndex({ assignedAgent: 1, createdAt: -1 })
   db.uploads.createIndex({ createdAt: -1 })
   \`\`\`

2. **Connection Pooling**
   \`\`\`javascript
   // lib/mongodb.ts
   const options = {
     maxPoolSize: 10,
     serverSelectionTimeoutMS: 5000,
     socketTimeoutMS: 45000,
   }
   \`\`\`

## Monitoring and Logging

### Application Monitoring

1. **Vercel Analytics** (if using Vercel)
   \`\`\`bash
   npm install @vercel/analytics
   \`\`\`

2. **Custom Logging**
   \`\`\`javascript
   // lib/logger.ts
   export const logger = {
     info: (message: string, data?: any) => {
       console.log(`[INFO] ${message}`, data)
     },
     error: (message: string, error?: any) => {
       console.error(`[ERROR] ${message}`, error)
     }
   }
   \`\`\`

### Health Checks

Create a health check endpoint:

\`\`\`typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    await connectToDatabase()
    return NextResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 500 }
    )
  }
}
\`\`\`

## Backup and Recovery

### Database Backup

1. **MongoDB Atlas**
   - Automatic backups are enabled by default
   - Configure backup retention policies
   - Test restore procedures

2. **Self-Hosted MongoDB**
   \`\`\`bash
   # Create backup
   mongodump --uri="mongodb://localhost:27017/agentx" --out=/backup/$(date +%Y%m%d)
   
   # Restore backup
   mongorestore --uri="mongodb://localhost:27017/agentx" /backup/20240101/agentx
   \`\`\`

### File Backup

1. **Cloudinary**
   - Files are automatically backed up
   - Configure auto-backup policies
   - Export media library periodically

## Troubleshooting

### Common Issues

1. **Build Failures**
   \`\`\`bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   \`\`\`

2. **Database Connection Issues**
   - Check connection string format
   - Verify network access (IP whitelist)
   - Test connection with MongoDB Compass

3. **Environment Variable Issues**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure proper escaping of special characters

### Debugging

1. **Enable Debug Logging**
   \`\`\`env
   DEBUG=*
   NODE_ENV=development
   \`\`\`

2. **Database Query Debugging**
   \`\`\`javascript
   // Enable MongoDB query logging
   mongoose.set('debug', true)
   \`\`\`

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing**
   - Use multiple application instances
   - Implement session-less authentication (JWT)
   - Use Redis for shared session storage if needed

2. **Database Scaling**
   - MongoDB replica sets for read scaling
   - Sharding for write scaling
   - Connection pooling optimization

### Vertical Scaling

1. **Server Resources**
   - Monitor CPU and memory usage
   - Scale server resources as needed
   - Optimize database queries

2. **CDN Integration**
   - Use Cloudinary's CDN for images
   - Implement static asset caching
   - Use edge caching for API responses

This deployment guide provides comprehensive instructions for deploying AgentX to various platforms while maintaining security, performance, and reliability standards.
