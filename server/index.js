const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('crypto');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8787;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

// Trust proxy for X-Forwarded-For headers
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting for admin-service
const adminRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requests per window per IP
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Utility functions
function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

async function loadJSON(filename) {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn(`Could not load ${filename}, using empty array`);
    return [];
  }
}

async function saveJSON(filename, data) {
  try {
    // Backup before saving
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = path.join(process.env.HOME, 'Desktop', 'PrePair', 'backup files');
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      const backupName = `gate-${timestamp}-${filename}`;
      const currentData = await fs.readFile(path.join(__dirname, 'data', filename), 'utf8');
      await fs.writeFile(path.join(backupDir, backupName), currentData);
      console.log(`Backup saved: ${backupName}`);
    } catch (backupError) {
      console.warn('Backup failed:', backupError.message);
    }

    // Save new data
    await fs.writeFile(
      path.join(__dirname, 'data', filename),
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error(`Failed to save ${filename}:`, error.message);
    throw error;
  }
}

function isIPInCIDR(ip, cidr) {
  if (!cidr.includes('/')) {
    return ip === cidr;
  }
  
  const [network, prefix] = cidr.split('/');
  const prefixNum = parseInt(prefix);
  
  // Simple IPv4 CIDR check (basic implementation)
  if (ip.includes('.') && network.includes('.')) {
    const ipParts = ip.split('.').map(Number);
    const networkParts = network.split('.').map(Number);
    
    const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    const networkNum = (networkParts[0] << 24) + (networkParts[1] << 16) + (networkParts[2] << 8) + networkParts[3];
    const mask = (-1 << (32 - prefixNum)) >>> 0;
    
    return (ipNum & mask) === (networkNum & mask);
  }
  
  return false;
}

async function checkIPAllowed(ip) {
  const allowList = await loadJSON('allow.json');
  const denyList = await loadJSON('deny.json');
  
  // Check deny list first
  for (const entry of denyList) {
    if (isIPInCIDR(ip, entry.ipOrCidr)) {
      return { allowed: false, reason: 'denied' };
    }
  }
  
  // Check allow list
  const now = Date.now();
  for (const entry of allowList) {
    if (isIPInCIDR(ip, entry.ipOrCidr)) {
      if (!entry.expiresAt || entry.expiresAt > now) {
        return { allowed: true, reason: 'allowed' };
      }
    }
  }
  
  return { allowed: false, reason: 'not_allowed' };
}

async function logAttempt(ip, userAgent) {
  const attempts = await loadJSON('attempts.json');
  const attempt = {
    id: generateId(),
    ip,
    userAgent,
    timestamp: new Date().toISOString()
  };
  
  attempts.push(attempt);
  await saveJSON('attempts.json', attempts);
  
  // Also log to file
  const logLine = `${attempt.timestamp} - ${ip} - ${userAgent} - ${attempt.id}\n`;
  await fs.appendFile(path.join(__dirname, 'logs', 'access.log'), logLine);
  
  return attempt.id;
}

// Cleanup expired entries every minute
setInterval(async () => {
  try {
    const allowList = await loadJSON('allow.json');
    const now = Date.now();
    const filtered = allowList.filter(entry => !entry.expiresAt || entry.expiresAt > now);
    
    if (filtered.length !== allowList.length) {
      await saveJSON('allow.json', filtered);
      console.log(`Cleaned up ${allowList.length - filtered.length} expired entries`);
    }
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}, 60000);

// Admin API endpoints (protected by token)
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
  next();
}

app.get('/api/attempts', requireAdmin, async (req, res) => {
  try {
    const attempts = await loadJSON('attempts.json');
    res.json(attempts.slice(-50)); // Last 50 attempts
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/allow', requireAdmin, async (req, res) => {
  try {
    const { ipOrCidr, ttlMs } = req.body;
    const allowList = await loadJSON('allow.json');
    
    const entry = {
      ipOrCidr,
      addedAt: Date.now(),
      expiresAt: ttlMs ? Date.now() + ttlMs : null
    };
    
    // Remove existing entry for same IP/CIDR
    const filtered = allowList.filter(e => e.ipOrCidr !== ipOrCidr);
    filtered.push(entry);
    
    await saveJSON('allow.json', filtered);
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/approve', requireAdmin, async (req, res) => {
  try {
    const { attemptId, ttlMs } = req.body;
    const attempts = await loadJSON('attempts.json');
    
    const attempt = attempts.find(a => a.id === attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }
    
    const allowList = await loadJSON('allow.json');
    const entry = {
      ipOrCidr: attempt.ip,
      addedAt: Date.now(),
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
      approvedFrom: attemptId
    };
    
    // Remove existing entry for same IP
    const filtered = allowList.filter(e => e.ipOrCidr !== attempt.ip);
    filtered.push(entry);
    
    await saveJSON('allow.json', filtered);
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/revoke', requireAdmin, async (req, res) => {
  try {
    const { ipOrCidr } = req.body;
    const allowList = await loadJSON('allow.json');
    const filtered = allowList.filter(e => e.ipOrCidr !== ipOrCidr);
    
    await saveJSON('allow.json', filtered);
    res.json({ success: true, removed: allowList.length - filtered.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/deny', requireAdmin, async (req, res) => {
  try {
    const { ipOrCidr } = req.body;
    const denyList = await loadJSON('deny.json');
    
    if (!denyList.find(e => e.ipOrCidr === ipOrCidr)) {
      denyList.push({ ipOrCidr, addedAt: Date.now() });
      await saveJSON('deny.json', denyList);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/allowlist', requireAdmin, async (req, res) => {
  try {
    const allowList = await loadJSON('allow.json');
    res.json(allowList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/denylist', requireAdmin, async (req, res) => {
  try {
    const denyList = await loadJSON('deny.json');
    res.json(denyList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Main admin-service route
app.get('/admin-service', adminRateLimit, async (req, res) => {
  try {
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const check = await checkIPAllowed(clientIP);
    
    if (check.reason === 'denied') {
      return res.status(403).send('Access denied.');
    }
    
    if (check.allowed) {
      // Success page
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PrePair Admin (Demo)</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .success { color: #059669; background: #d1fae5; padding: 20px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ Gate Passed</h1>
            <p><strong>PrePair Admin Access (Demo)</strong></p>
            <p>Your IP ${clientIP} is approved for admin access.</p>
            <p>This is a placeholder admin area. Future tools will be added here.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Log attempt and show pending page
    const attemptId = await logAttempt(clientIP, userAgent);
    
    res.status(403).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pending Approval - PrePair</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #fefce8; }
          .pending { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; }
          .code { font-family: monospace; background: white; padding: 8px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="pending">
          <h1>🔒 Pending Approval</h1>
          <p>Your access request has been logged.</p>
          <p><strong>Attempt ID:</strong> <span class="code">${attemptId}</span></p>
          <p><strong>Your IP:</strong> <span class="code">${clientIP}</span></p>
          <p>Ask the admin to approve this attempt and refresh the page.</p>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Admin service error:', error);
    res.status(500).send('Internal server error');
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} (trust proxy on)`);
  console.log('Admin endpoints require ADMIN_TOKEN authentication');
});

module.exports = app;