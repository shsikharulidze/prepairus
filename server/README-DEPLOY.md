# PrePair Admin Gate - Deployment Guide

This service provides IP-based access control for PrePair admin areas.

## Quick Deploy Options

### 1. Render (Recommended)

1. **Create Web Service**:
   - Go to [render.com](https://render.com)
   - Connect your GitHub repo
   - Choose "Web Service"
   - Set root directory to `server/` if deploying from main repo

2. **Configure Service**:
   - **Name**: `prepair-admin-gate`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Environment Variables**:
   ```
   PORT=8787
   ADMIN_TOKEN=your-super-secure-random-token-here
   NODE_ENV=production
   ```

4. **Custom Domain** (optional):
   - Add custom domain: `admin.prepair.site`
   - Configure DNS: CNAME `admin.prepair.site` → `your-app.onrender.com`

### 2. Railway

1. **Deploy**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

2. **Environment Variables**:
   ```bash
   railway variables set ADMIN_TOKEN=your-secure-token
   railway variables set NODE_ENV=production
   ```

3. **Custom Domain**:
   ```bash
   railway domain add admin.prepair.site
   ```

### 3. Fly.io

1. **Setup**:
   ```bash
   npm install -g @flydotio/flyctl
   fly auth login
   fly launch --no-deploy
   ```

2. **Configure `fly.toml`**:
   ```toml
   app = "prepair-admin-gate"
   
   [env]
     NODE_ENV = "production"
   
   [[services]]
     internal_port = 8787
     protocol = "tcp"
   
     [[services.ports]]
       handlers = ["http"]
       port = 80
   
     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443
   ```

3. **Set Secrets**:
   ```bash
   fly secrets set ADMIN_TOKEN=your-secure-token
   fly deploy
   ```

### 4. Vercel (API Routes)

Note: For Vercel, consider restructuring as API routes or use other platforms for better Node.js support.

1. **Convert to API Routes**:
   - Move routes to `api/` directory
   - Each route becomes a separate file
   - Use Vercel's serverless functions

2. **Alternative**: Use Render/Railway for simpler deployment

## DNS Configuration

### Custom Domain Setup

1. **Configure DNS** (at your domain registrar):
   ```
   Type: CNAME
   Name: admin.prepair.site
   Value: your-deployment-url.onrender.com
   ```

2. **Enable Trust Proxy**: Ensure your deployment platform forwards the real IP:
   - Render: Automatic
   - Railway: Automatic  
   - Fly.io: Configure in fly.toml
   - Cloudflare: Set to "Full" SSL mode

## CLI Usage (Remote)

### Local CLI Against Remote Server

1. **Setup Environment**:
   ```bash
   export ADMIN_TOKEN=your-secure-token
   export SERVER_URL=https://admin.prepair.site
   ```

2. **Install Dependencies**:
   ```bash
   cd server/
   npm install node-fetch  # For CLI API calls
   ```

3. **CLI Commands**:
   ```bash
   # View recent attempts
   node cli.js attempts
   
   # Approve an attempt for 45 minutes
   node cli.js approve abc123def --ttl 45m
   
   # Add IP directly with 2 hour TTL
   node cli.js allow 192.168.1.100 --ttl 2h
   
   # Add CIDR range with 1 day TTL
   node cli.js allow 10.0.0.0/24 --ttl 1d
   
   # Revoke access
   node cli.js revoke 192.168.1.100
   
   # View allowlist/denylist
   node cli.js allowlist
   node cli.js denylist
   ```

## Security Considerations

### 1. ADMIN_TOKEN
- Generate a strong random token (32+ characters)
- Use a password manager or secure generation tool
- Never commit tokens to version control

### 2. HTTPS Only
- Always use HTTPS in production
- Most platforms (Render, Railway, Fly) provide automatic HTTPS
- Verify SSL certificate is valid

### 3. Rate Limiting
- Built-in rate limiting: 30 requests per 5 minutes per IP
- Adjust in `index.js` if needed for your use case

### 4. Backup Strategy
- JSON files are automatically backed up before changes
- Backups saved to `~/Desktop/PrePair/backup files/`
- Consider additional backup solutions for production

## Testing Your Deployment

### 1. Health Check
```bash
curl https://admin.prepair.site/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Admin Access Test
1. Visit `https://admin.prepair.site/admin-service` in incognito mode
2. Note the attempt ID from the "Pending Approval" page
3. Approve via CLI: `node cli.js approve <attempt-id> --ttl 30m`
4. Refresh page - should show "Gate Passed"

### 3. CLI Test
```bash
# Test authentication
node cli.js attempts

# Should show recent access attempts
```

## Troubleshooting

### Common Issues

1. **"Invalid admin token" error**:
   - Verify ADMIN_TOKEN is set correctly
   - Check for extra spaces or quotes

2. **CLI can't connect**:
   - Verify SERVER_URL is correct
   - Test health endpoint in browser first
   - Check network/firewall settings

3. **Real IP not detected**:
   - Verify platform is forwarding X-Forwarded-For
   - Check "trust proxy" setting is enabled

4. **Backup directory errors**:
   - Ensure local backup directory exists
   - Check file permissions

### Debug Mode

Set `NODE_ENV=development` for verbose logging:
```bash
NODE_ENV=development node index.js
```

## API Endpoints Reference

All admin endpoints require `Authorization: Bearer <ADMIN_TOKEN>` header:

- `GET /api/attempts` - List recent attempts
- `POST /api/approve` - Approve attempt by ID
- `POST /api/allow` - Add IP to allowlist
- `DELETE /api/revoke` - Remove IP from allowlist  
- `POST /api/deny` - Add IP to denylist
- `GET /api/allowlist` - List allowed IPs
- `GET /api/denylist` - List denied IPs

## Monitoring

### Log Files
- Server logs: Platform-specific (Render logs, Railway logs, etc.)
- Access attempts: `logs/access.log` (in deployed environment)

### Recommended Monitoring
- Set up uptime monitoring (UptimeRobot, etc.)
- Monitor for unusual access patterns
- Regular review of allowlist/denylist

---

**Next Steps**: After deployment, update your main PrePair site to link to the deployed admin service instead of the local placeholder.