# Deployment Guide

This guide covers deployment of STEM Commons frontend to various platforms.

## Table of Contents

1. [Vercel](#vercel)
2. [Netlify](#netlify)
3. [Docker](#docker)
4. [AWS S3 + CloudFront](#aws-s3--cloudfront)
5. [GitHub Pages](#github-pages)
6. [Self-Hosted](#self-hosted)

---

## Vercel

### Prerequisites

- Vercel account (free at vercel.com)
- GitHub repository
- Node.js 18+

### One-Click Deploy

```bash
npm i -g vercel
vercel
```

Or click the Vercel Deploy button in your GitHub repo.

### Environment Variables

Add in Vercel dashboard:

```env
VITE_API_URL=https://api.stemcommons.in/api/v1
VITE_ENV=production
```

### Auto-Deploy

Push to `main` branch → Vercel auto-deploys.

For preview deploys on PRs, it's automatic.

### Custom Domain

1. Go to Vercel project settings
2. Add domain in "Domains" section
3. Update DNS records (CNAME/A)

---

## Netlify

### Prerequisites

- Netlify account (free at netlify.com)
- GitHub repository
- Node.js 18+

### Connect Repository

1. Sign in to Netlify
2. Click "New site from Git"
3. Select GitHub
4. Choose repository
5. Set build command: `npm run build`
6. Set publish directory: `dist`
7. Deploy

### Environment Variables

Settings → Environment:

```env
VITE_API_URL=https://api.stemcommons.in/api/v1
VITE_ENV=production
```

### Custom Domain

1. Domain settings → Custom domain
2. Add your domain
3. Update DNS records at your registrar

---

## Docker

### Production Build

```bash
docker build -f Dockerfile -t stem-commons-web:1.0 .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e VITE_API_URL=https://api.stemcommons.in/api/v1 \
  stem-commons-web:1.0
```

### Docker Compose

```bash
# From root directory
docker-compose up -d frontend
```

### Push to Registry

```bash
docker tag stem-commons-web:1.0 your-registry/stem-commons-web:1.0
docker push your-registry/stem-commons-web:1.0
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stem-commons-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: stem-commons-web
  template:
    metadata:
      labels:
        app: stem-commons-web
    spec:
      containers:
      - name: web
        image: your-registry/stem-commons-web:1.0
        ports:
        - containerPort: 3000
        env:
        - name: VITE_API_URL
          value: "https://api.stemcommons.in/api/v1"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: stem-commons-web
spec:
  selector:
    app: stem-commons-web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## AWS S3 + CloudFront

### Prerequisites

- AWS account
- AWS CLI configured

### Build

```bash
npm run build
```

### Upload to S3

```bash
# Create bucket
aws s3 mb s3://stem-commons-web

# Set bucket policy for public access
aws s3api put-bucket-policy \
  --bucket stem-commons-web \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::stem-commons-web/*"
    }]
  }'

# Upload dist folder
aws s3 sync dist s3://stem-commons-web \
  --delete \
  --cache-control max-age=31536000,public
```

### CloudFront Distribution

```bash
# Create distribution
aws cloudfront create-distribution \
  --origin-domain-name stem-commons-web.s3.amazonaws.com \
  --default-root-object index.html
```

### Configure Cache

1. Go to CloudFront distribution
2. Set default TTL to 0 for `index.html`
3. Set TTL to 1 year for other files
4. Create invalidation for `/*` after deploy

### Custom Domain

1. Add CNAME in Route53
2. Point to CloudFront domain

---

## GitHub Pages

### Build and Deploy

```bash
npm run build

# Push dist to gh-pages branch
npm install ghpages --save-dev

# In package.json add:
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

npm run deploy
```

### Configure

1. Go to repository Settings
2. Pages → Source: Deploy from branch
3. Select gh-pages branch
4. Save

### URL

Your site will be available at:
```
https://username.github.io/stem-commons/
```

Update `vite.config.ts`:

```typescript
export default {
  base: '/stem-commons/',
  // ...
}
```

---

## Self-Hosted

### Prerequisites

- Linux server (Ubuntu recommended)
- Node.js 18+
- Nginx or Apache
- SSL certificate (Let's Encrypt)

### Setup

```bash
# SSH into server
ssh user@your-server.com

# Clone repo
git clone https://github.com/your-org/stem-commons.git
cd stem-commons/frontend

# Install dependencies
npm install

# Build
npm run build
```

### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name stemcommons.in www.stemcommons.in;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stemcommons.in www.stemcommons.in;

    ssl_certificate /etc/letsencrypt/live/stemcommons.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stemcommons.in/privkey.pem;

    root /home/stem-commons/frontend/dist;
    index index.html;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### SSL Certificate

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d stemcommons.in -d www.stemcommons.in
```

### Deploy Script

```bash
#!/bin/bash
cd /home/stem-commons/frontend
git pull origin main
npm install
npm run build
sudo systemctl restart nginx
```

Save as `deploy.sh` and run via cron:

```bash
0 2 * * * /home/stem-commons/frontend/deploy.sh
```

---

## Environment Variables

### Development

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_ENV=development
VITE_LOG_LEVEL=debug
```

### Staging

```env
VITE_API_URL=https://api-staging.stemcommons.in/api/v1
VITE_ENV=staging
VITE_LOG_LEVEL=info
```

### Production

```env
VITE_API_URL=https://api.stemcommons.in/api/v1
VITE_ENV=production
VITE_LOG_LEVEL=error
```

---

## Monitoring

### Application Errors

Set up error tracking:

```typescript
// src/lib/errorTracking.ts
export function setupErrorTracking() {
  if (import.meta.env.VITE_ENV === "production") {
    // Setup Sentry, LogRocket, or similar
    window.addEventListener("error", (event) => {
      console.error("Frontend error:", event.error);
      // Send to backend
    });
  }
}
```

### Performance Monitoring

```typescript
// Measure Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## Rollback

### Vercel

Click "Redeploy" on previous deployment.

### Netlify

Go to "Deploys" and select previous version.

### Docker/Self-Hosted

```bash
# Previous version
docker run -p 3000:3000 stem-commons-web:previous-tag

# Or git
git revert <commit-hash>
npm run build
```

---

## Troubleshooting

### Build fails

```bash
rm -rf node_modules dist
npm install
npm run build
```

### 404 errors on page refresh

Ensure `index.html` fallback is configured in:
- Vercel: Automatic
- Netlify: Add `_redirects` file
- S3: Configure error document
- Nginx: `try_files $uri /index.html`

### API calls failing

Check:
1. `VITE_API_URL` is set correctly
2. CORS headers on backend
3. Network tab in DevTools
4. Backend is running

### Slow performance

- Enable gzip compression
- Set cache headers
- Use CDN (CloudFront, Cloudflare)
- Optimize images
- Code split

---

## Checklist

Before production deploy:

- [ ] Build succeeds locally
- [ ] Environment variables set
- [ ] API URL correct
- [ ] No console errors
- [ ] Security headers configured
- [ ] SSL certificate valid
- [ ] Backups available
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Team notified

---

## Support

For deployment issues:
1. Check deployment logs
2. Review [DEVELOPMENT.md](./DEVELOPMENT.md)
3. See [README.md](./README.md)
4. Submit GitHub issue

---

Last updated: June 2026
