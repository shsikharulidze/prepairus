#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8787';

function parseTTL(ttlString) {
  if (!ttlString) return null;
  
  const match = ttlString.match(/^(\d+)([mhd])$/);
  if (!match) {
    throw new Error('Invalid TTL format. Use: 30m, 2h, 1d');
  }
  
  const [, amount, unit] = match;
  const multipliers = { m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return parseInt(amount) * multipliers[unit];
}

async function apiCall(endpoint, method = 'GET', body = null) {
  const fetch = (await import('node-fetch')).default;
  
  if (!ADMIN_TOKEN) {
    console.error('ADMIN_TOKEN not set in environment');
    process.exit(1);
  }
  
  try {
    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error (${response.status}): ${error}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error.message);
    process.exit(1);
  }
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function formatTTL(expiresAt) {
  if (!expiresAt) return 'Never';
  const now = Date.now();
  if (expiresAt <= now) return 'Expired';
  
  const diffMs = expiresAt - now;
  const diffMins = Math.round(diffMs / (1000 * 60));
  
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d`;
}

async function showAttempts() {
  console.log('Recent access attempts:');
  console.log('');
  
  const attempts = await apiCall('/api/attempts');
  
  if (attempts.length === 0) {
    console.log('No attempts logged yet.');
    return;
  }
  
  console.log('ID'.padEnd(12) + 'IP'.padEnd(16) + 'Time'.padEnd(20) + 'User Agent');
  console.log('-'.repeat(80));
  
  attempts.slice(-10).forEach(attempt => {
    const id = attempt.id.padEnd(12);
    const ip = (attempt.ip || 'unknown').padEnd(16);
    const time = formatDate(attempt.timestamp).padEnd(20);
    const ua = (attempt.userAgent || 'Unknown').substring(0, 30);
    console.log(`${id}${ip}${time}${ua}`);
  });
}

async function approveAttempt(attemptId, ttl) {
  const ttlMs = parseTTL(ttl);
  
  const result = await apiCall('/api/approve', 'POST', {
    attemptId,
    ttlMs
  });
  
  console.log(`✅ Approved attempt ${attemptId}`);
  console.log(`IP: ${result.entry.ipOrCidr}`);
  console.log(`Expires: ${ttlMs ? formatDate(result.entry.expiresAt) : 'Never'}`);
}

async function allowIP(ipOrCidr, ttl) {
  const ttlMs = parseTTL(ttl);
  
  const result = await apiCall('/api/allow', 'POST', {
    ipOrCidr,
    ttlMs
  });
  
  console.log(`✅ Added to allowlist: ${ipOrCidr}`);
  console.log(`Expires: ${ttlMs ? formatDate(result.entry.expiresAt) : 'Never'}`);
}

async function revokeIP(ipOrCidr) {
  const result = await apiCall('/api/revoke', 'DELETE', { ipOrCidr });
  
  if (result.removed > 0) {
    console.log(`✅ Revoked: ${ipOrCidr}`);
  } else {
    console.log(`ℹ️  IP not found in allowlist: ${ipOrCidr}`);
  }
}

async function denyIP(ipOrCidr) {
  await apiCall('/api/deny', 'POST', { ipOrCidr });
  console.log(`🚫 Added to denylist: ${ipOrCidr}`);
}

async function showAllowlist() {
  console.log('IP Allowlist:');
  console.log('');
  
  const allowList = await apiCall('/api/allowlist');
  
  if (allowList.length === 0) {
    console.log('No IPs in allowlist.');
    return;
  }
  
  console.log('IP/CIDR'.padEnd(20) + 'Added'.padEnd(20) + 'Expires'.padEnd(12) + 'Status');
  console.log('-'.repeat(70));
  
  allowList.forEach(entry => {
    const ip = entry.ipOrCidr.padEnd(20);
    const added = formatDate(entry.addedAt).padEnd(20);
    const expires = formatTTL(entry.expiresAt).padEnd(12);
    const status = (!entry.expiresAt || entry.expiresAt > Date.now()) ? '✅ Active' : '❌ Expired';
    console.log(`${ip}${added}${expires}${status}`);
  });
}

async function showDenylist() {
  console.log('IP Denylist:');
  console.log('');
  
  const denyList = await apiCall('/api/denylist');
  
  if (denyList.length === 0) {
    console.log('No IPs in denylist.');
    return;
  }
  
  console.log('IP/CIDR'.padEnd(20) + 'Added');
  console.log('-'.repeat(40));
  
  denyList.forEach(entry => {
    const ip = entry.ipOrCidr.padEnd(20);
    const added = formatDate(entry.addedAt);
    console.log(`${ip}${added}`);
  });
}

function showHelp() {
  console.log('PrePair Admin Gate CLI');
  console.log('');
  console.log('Usage:');
  console.log('  node cli.js attempts                     - Show recent access attempts');
  console.log('  node cli.js approve <attemptId> --ttl 30m - Approve attempt with TTL');
  console.log('  node cli.js allow <ip/cidr> --ttl 1h      - Add IP to allowlist');
  console.log('  node cli.js revoke <ip/cidr>              - Remove IP from allowlist');
  console.log('  node cli.js deny <ip/cidr>                - Add IP to denylist');
  console.log('  node cli.js allowlist                     - Show current allowlist');
  console.log('  node cli.js denylist                      - Show current denylist');
  console.log('');
  console.log('TTL formats: 30m (minutes), 2h (hours), 1d (days)');
  console.log('');
  console.log('Environment variables:');
  console.log('  ADMIN_TOKEN - Required for API authentication');
  console.log('  SERVER_URL  - Server URL (default: http://localhost:8787)');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'attempts':
        await showAttempts();
        break;
        
      case 'approve':
        if (args.length < 2) {
          console.error('Usage: approve <attemptId> --ttl <duration>');
          process.exit(1);
        }
        const attemptId = args[1];
        const ttlIndex = args.indexOf('--ttl');
        const ttl = ttlIndex !== -1 ? args[ttlIndex + 1] : null;
        await approveAttempt(attemptId, ttl);
        break;
        
      case 'allow':
        if (args.length < 2) {
          console.error('Usage: allow <ip/cidr> --ttl <duration>');
          process.exit(1);
        }
        const ipToAllow = args[1];
        const allowTtlIndex = args.indexOf('--ttl');
        const allowTtl = allowTtlIndex !== -1 ? args[allowTtlIndex + 1] : null;
        await allowIP(ipToAllow, allowTtl);
        break;
        
      case 'revoke':
        if (args.length < 2) {
          console.error('Usage: revoke <ip/cidr>');
          process.exit(1);
        }
        await revokeIP(args[1]);
        break;
        
      case 'deny':
        if (args.length < 2) {
          console.error('Usage: deny <ip/cidr>');
          process.exit(1);
        }
        await denyIP(args[1]);
        break;
        
      case 'allowlist':
        await showAllowlist();
        break;
        
      case 'denylist':
        await showDenylist();
        break;
        
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
        
      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Handle missing node-fetch gracefully
if (require.main === module) {
  main().catch(error => {
    if (error.code === 'ERR_MODULE_NOT_FOUND' && error.message.includes('node-fetch')) {
      console.error('node-fetch not available. Install with: npm install node-fetch');
      console.error('Or use the server API endpoints directly.');
    } else {
      console.error('CLI error:', error.message);
    }
    process.exit(1);
  });
}