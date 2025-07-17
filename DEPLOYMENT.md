# SolarScheduler Deployment Guide

## GitHub Pages Deployment (Static)

This repository is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment
- **Trigger**: Every push to `main` branch
- **Workflow**: `.github/workflows/deploy.yml`
- **URL**: `https://mrmoe28.github.io/solarscheduler-website/`

### What Gets Deployed
The GitHub Actions workflow deploys only static files:
- All HTML files (index.html, landing.html, login.html, app.html, etc.)
- All CSS files (styles.css, app.css, landing.css, login.css)
- All JavaScript files (script.js, app.js, landing.js, login.js)
- PWA files (manifest.json, sw.js)
- Assets (icons/, images/, videos/)

### What's Excluded from Deployment
- Server files (server.js)
- Node.js dependencies (node_modules/, package.json)
- Environment files (.env)
- Log files (*.log)
- Development files

### Static vs. Server Features

#### ✅ Available on GitHub Pages (Static)
- **Landing Page** - Full animated landing page
- **Authentication UI** - Login/signup forms (local storage)
- **App Interface** - Complete PWA interface
- **PWA Installation** - "Add to Home Screen" functionality
- **Service Worker** - Offline functionality and caching
- **Demo Mode** - Local user management for testing

#### ❌ Not Available on GitHub Pages (Requires Server)
- **Stripe Integration** - Real payment processing
- **Server-side Authentication** - Database user management
- **API Endpoints** - Subscription validation
- **Webhook Handling** - Stripe webhook processing

## Production Server Deployment

For full functionality with Stripe integration, deploy to a Node.js hosting service:

### Recommended Hosting Services
- **Vercel** - Easy Node.js deployment
- **Netlify** - Serverless functions support
- **Railway** - Full-stack deployment
- **Heroku** - Traditional PaaS hosting
- **DigitalOcean App Platform** - Container-based hosting

### Environment Variables Required
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=3000
NODE_ENV=production
```

### Production Deployment Steps
1. Choose hosting service
2. Connect GitHub repository
3. Set environment variables
4. Deploy from main branch
5. Configure custom domain (optional)

## Development Setup

### Local Development (Full Features)
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Stripe keys

# Start server
node server.js
```

### Static Development (GitHub Pages Preview)
Simply open `index.html` in a web browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

## GitHub Pages Configuration

### Enable GitHub Pages
1. Go to repository Settings
2. Navigate to Pages section
3. Source: Deploy from a branch OR GitHub Actions
4. Branch: `main` (if using branch deployment)
5. Folder: `/ (root)` (if using branch deployment)

### Custom Domain (Optional)
1. Add CNAME file with your domain
2. Configure DNS settings
3. Enable "Enforce HTTPS"

## Testing the Deployment

### Verify Static Features
- [ ] Landing page loads and animations work
- [ ] Login forms function (local storage)
- [ ] App interface displays correctly
- [ ] PWA installation prompts appear
- [ ] Service worker caches resources
- [ ] Offline functionality works

### Verify Server Features (Production Only)
- [ ] Stripe payment processing
- [ ] Real user authentication
- [ ] Subscription validation
- [ ] Webhook handling
- [ ] Database integration

## Troubleshooting

### Common GitHub Pages Issues
1. **404 Error**: Check if GitHub Pages is enabled in repository settings
2. **Files Not Found**: Ensure workflow copies all necessary files
3. **CSS/JS Not Loading**: Check file paths are relative, not absolute
4. **PWA Not Working**: Verify manifest.json and service worker paths

### Common Production Issues
1. **Stripe Errors**: Check environment variables and API keys
2. **CORS Issues**: Configure proper CORS headers for your domain
3. **Database Connection**: Ensure database is accessible from hosting service
4. **Webhook Failures**: Verify webhook URL and secret in Stripe dashboard

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Review console errors in browser
3. Test locally first
4. Contact support team if needed