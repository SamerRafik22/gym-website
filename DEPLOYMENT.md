# 🚀 Deployment & Domain Setup Guide

## Overview
This guide covers multiple deployment options for your RedefineLab Gym Website, from free hosting to custom domains.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env.production` file with:
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_strong_jwt_secret_here
PORT=3000
# Optional HTTPS in production
HTTPS_PORT=3443
SSL_KEY_PATH=/path/to/ssl/private.key
SSL_CERT_PATH=/path/to/ssl/certificate.crt
```

### 2. Database Setup
- **MongoDB Atlas** (Recommended): Free tier available
  - Sign up at https://www.mongodb.com/atlas
  - Create cluster → Get connection string
  - Replace `MONGODB_URI` in your environment variables

### 3. Security Review
- ✅ Environment variables properly configured
- ✅ No sensitive data in code
- ✅ HTTPS enabled
- ✅ Rate limiting configured
- ✅ Helmet security headers active

## 🌐 Deployment Options

### Option 1: Vercel (Recommended for Node.js)
**Pros**: Free, automatic HTTPS, global CDN, GitHub integration
**Cons**: Serverless limitations, cold starts

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Custom domain
vercel domains add yourdomain.com
```

**Setup Steps**:
1. Push code to GitHub
2. Connect GitHub to Vercel
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy automatically on push

### Option 2: Railway
**Pros**: Full Node.js support, databases included, simple pricing
**Cons**: Paid after free tier

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

**Setup Steps**:
1. Sign up at https://railway.app
2. Connect GitHub repository
3. Add environment variables
4. Deploy with automatic builds

### Option 3: Render
**Pros**: Free tier, full app support, automatic SSL
**Cons**: Free tier has limitations

**Setup Steps**:
1. Push to GitHub
2. Sign up at https://render.com
3. Create new Web Service
4. Connect GitHub repo
5. Configure environment variables
6. Deploy

### Option 4: DigitalOcean App Platform
**Pros**: Professional hosting, scalable, good performance
**Cons**: Paid service

**Setup Steps**:
1. Sign up at https://www.digitalocean.com
2. Create new App
3. Connect GitHub repository
4. Configure environment variables
5. Add custom domain

### Option 5: Traditional VPS (Advanced)
**Pros**: Full control, can handle high traffic
**Cons**: Requires server management skills

## 🌍 Custom Domain Setup

### Free Domain Options
1. **Freenom** (.tk, .ml, .ga) - Free but limited
2. **GitHub Pages** with custom domain - Static only
3. **Netlify** subdomain - app-name.netlify.app

### Paid Domain Options (Recommended)
1. **Namecheap** ($8-15/year)
2. **GoDaddy** ($12-20/year)
3. **Cloudflare** ($8-10/year) + DNS management

### Domain Configuration
1. **Purchase domain** from registrar
2. **Configure DNS**:
   ```
   Type: A
   Name: @
   Value: [Your hosting IP]
   
   Type: CNAME
   Name: www
   Value: yourdomain.com
   ```
3. **Update hosting platform** with custom domain
4. **Enable SSL** (usually automatic)

## 🎯 Deployment Examples

### Quick Deploy to Vercel
```bash
# 1. Prepare app
npm run deploy:prepare

# 2. Deploy to Vercel
npm run deploy:vercel
```

### Quick Deploy to Railway
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Deploy
npm run deploy:railway
```

### Docker Deployment
```bash
# Build image
docker build -t redefinelab-gym .

# Run container
docker run -p 3000:3000 --env-file .env.production redefinelab-gym
```

## 🔧 Production Optimizations

### 1. Environment-Specific Configuration
```javascript
// app.js - Production optimizations
if (process.env.NODE_ENV === 'production') {
    // Trust proxy for proper HTTPS detection
    app.set('trust proxy', 1);
    
    // Enhanced security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", "https://api.open-meteo.com"],
                // ... other directives
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));
}
```

### 2. Database Connection Optimization
```javascript
// For production MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
});
```

## 🎉 Launch Checklist

### Before Going Live
- [ ] Database properly configured
- [ ] Environment variables set
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Email functionality tested
- [ ] Forms working correctly
- [ ] Admin panel accessible
- [ ] Mobile responsiveness verified
- [ ] Weather API functioning
- [ ] All routes tested

### After Launch
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify SEO metadata
- [ ] Test user registration flow
- [ ] Confirm email notifications
- [ ] Monitor database performance

## 💡 Cost Estimates

### Free Options
- **Vercel**: Free (with usage limits)
- **Railway**: $5/month after free tier
- **Render**: Free (with limitations)
- **MongoDB Atlas**: Free 512MB

### Professional Options
- **Domain**: $10-15/year
- **Hosting**: $5-25/month
- **Database**: $9-50/month
- **SSL Certificate**: Free (Let's Encrypt)

## 🆘 Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify MongoDB URI and network access
3. **SSL Issues**: Ensure proper certificate configuration
4. **Environment Variables**: Double-check all required variables
5. **Port Issues**: Use process.env.PORT for hosting platforms

### Support Resources
- Platform documentation
- Community forums
- GitHub Issues
- Stack Overflow

## 🎯 Bonus Points Achievement

To earn the full **5 points for Deployment & Domain**:
- ✅ Deploy to a hosting platform
- ✅ Configure custom domain
- ✅ Enable HTTPS
- ✅ Set up production database
- ✅ Configure environment variables
- ✅ Implement monitoring/logging

**Recommended Quick Start**: Vercel + Namecheap domain + MongoDB Atlas = Professional setup in 30 minutes!