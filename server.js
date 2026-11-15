/**
 * FEALITY ITALY - Secure Web Server, MySQL Database & Admin API
 * Powered by Node.js with native .env loading and MySQL 8.0 (feality_italy).
 * Includes SQLite backup, rate-limiting, static file sandbox, and security headers.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname);
const DATA_DIR = path.join(ROOT, 'data');

// -----------------------------------------------------------------------------
// 1. Secure Environment Loading (.env)
// -----------------------------------------------------------------------------
function loadEnvironment() {
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    if (typeof process.loadEnvFile === 'function') {
      try {
        process.loadEnvFile(envPath);
        return;
      } catch (err) {
        console.warn(`[Config] Native loadEnvFile notice: ${err.message}`);
      }
    }
    // Lightweight parser fallback
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!(key in process.env)) {
            process.env[key] = val;
          }
        }
      }
    } catch (err) {
      console.warn(`[Config] Fallback .env read notice: ${err.message}`);
    }
  }
}
loadEnvironment();

const PORT = Number(process.env.PORT || 3000);
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

// Admin Password Resolution (No hardcoded credentials)
let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  ADMIN_PASSWORD = crypto.randomBytes(16).toString('hex');
  console.warn(`\n[SECURITY ALERT] ADMIN_PASSWORD was not set in .env!`);
  console.warn(`[SECURITY ALERT] Generated temporary admin password: ${ADMIN_PASSWORD}\n`);
}

// MySQL Configuration
const MYSQL_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'feality_italy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Safe public contact configurations (served via /api/config)
const PUBLIC_CONFIG = {
  email: process.env.CONTACT_EMAIL || '',
  whatsapp: process.env.WHATSAPP_NUMBER || '',
  phone: process.env.PHONE_NUMBER || ''
};

// Ensure data directory exists for backups / fallbacks
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// -----------------------------------------------------------------------------
// 2. Database Layer: MySQL (Primary) with SQLite (Fallback)
// -----------------------------------------------------------------------------
let dbMode = 'mysql';
let mysqlPool = null;
let sqliteDb = null;

try {
  const mysql = require('mysql2/promise');
  mysqlPool = mysql.createPool(MYSQL_CONFIG);
  console.log(`[DB] MySQL pool configured for '${MYSQL_CONFIG.database}' on port ${MYSQL_CONFIG.port}`);
} catch (err) {
  console.warn(`[DB] mysql2 driver error, falling back to SQLite: ${err.message}`);
  dbMode = 'sqlite';
}

// Initialize SQLite fallback
try {
  const { DatabaseSync } = require('node:sqlite');
  const dbPath = path.join(DATA_DIR, 'enquiries.db');
  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE,
      created_at TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      city TEXT,
      collection TEXT,
      design_id TEXT,
      message TEXT,
      budget TEXT,
      source_page TEXT,
      status TEXT DEFAULT 'New'
    );
  `);
} catch (_) {}

// Ensure MySQL table exists on startup
async function initMysql() {
  if (!mysqlPool) return;
  try {
    const conn = await mysqlPool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id VARCHAR(64) PRIMARY KEY,
        reference VARCHAR(64) UNIQUE,
        created_at DATETIME NOT NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        email VARCHAR(160) DEFAULT NULL,
        city VARCHAR(100) DEFAULT NULL,
        collection VARCHAR(50) DEFAULT 'General enquiry',
        design_id VARCHAR(50) DEFAULT NULL,
        message TEXT DEFAULT NULL,
        budget VARCHAR(50) DEFAULT NULL,
        source_page VARCHAR(100) DEFAULT 'contact.html',
        status VARCHAR(20) DEFAULT 'New'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    conn.release();
    console.log(`[DB] Verified MySQL table 'enquiries' in '${MYSQL_CONFIG.database}'`);
  } catch (err) {
    console.error(`[DB] Could not connect to MySQL server: ${err.message}`);
    console.log(`[DB] Reverting to SQLite backup store.`);
    dbMode = 'sqlite';
  }
}
initMysql();

async function getAllEnquiries() {
  if (dbMode === 'mysql' && mysqlPool) {
    try {
      const [rows] = await mysqlPool.query('SELECT * FROM enquiries ORDER BY created_at DESC');
      return rows;
    } catch (err) {
      console.error(`[DB Error] MySQL query failed: ${err.message}`);
    }
  }
  if (sqliteDb) {
    try {
      return sqliteDb.prepare('SELECT * FROM enquiries ORDER BY created_at DESC').all();
    } catch (_) {}
  }
  return [];
}

async function saveEnquiry(record) {
  const mysqlDate = new Date(record.created_at).toISOString().slice(0, 19).replace('T', ' ');

  if (dbMode === 'mysql' && mysqlPool) {
    try {
      await mysqlPool.execute(
        `INSERT INTO enquiries (id, reference, created_at, name, phone, email, city, collection, design_id, message, budget, source_page, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          record.reference,
          mysqlDate,
          record.name,
          record.phone,
          record.email || null,
          record.city || null,
          record.collection || 'General enquiry',
          record.design_id || null,
          record.message || null,
          record.budget || null,
          record.source_page || 'contact.html',
          record.status || 'New'
        ]
      );
      console.log(`[MySQL] Stored lead in phpMyAdmin 'feality_italy.enquiries' (Ref: ${record.reference})`);
    } catch (err) {
      console.error(`[MySQL Error] Failed to insert: ${err.message}`);
    }
  }

  // Backup store to local SQLite
  if (sqliteDb) {
    try {
      const stmt = sqliteDb.prepare(`
        INSERT INTO enquiries (id, reference, created_at, name, phone, email, city, collection, design_id, message, budget, source_page, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        record.id, record.reference, record.created_at, record.name, record.phone,
        record.email || '', record.city || '', record.collection || '', record.design_id || '',
        record.message || '', record.budget || '', record.source_page || '', record.status || 'New'
      );
    } catch (_) {}
  }

  return record;
}

async function updateEnquiryStatus(id, newStatus) {
  if (dbMode === 'mysql' && mysqlPool) {
    try {
      await mysqlPool.execute('UPDATE enquiries SET status = ? WHERE id = ? OR reference = ?', [newStatus, id, id]);
      return true;
    } catch (_) {}
  }
  if (sqliteDb) {
    try {
      sqliteDb.prepare('UPDATE enquiries SET status = ? WHERE id = ? OR reference = ?').run(newStatus, id, id);
      return true;
    } catch (_) {}
  }
  return false;
}

async function deleteEnquiry(id) {
  if (dbMode === 'mysql' && mysqlPool) {
    try {
      await mysqlPool.execute('DELETE FROM enquiries WHERE id = ? OR reference = ?', [id, id]);
      return true;
    } catch (_) {}
  }
  if (sqliteDb) {
    try {
      sqliteDb.prepare('DELETE FROM enquiries WHERE id = ? OR reference = ?').run(id, id);
      return true;
    } catch (_) {}
  }
  return false;
}

// -----------------------------------------------------------------------------
// 3. Security Utilities: Rate Limiting & Auth Comparison
// -----------------------------------------------------------------------------
const enquiryRateLimit = new Map();
const adminLoginAttempts = new Map();

function isRateLimited(store, key, maxLimit, windowMs) {
  const now = Date.now();
  const record = store.get(key);
  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  record.count++;
  return record.count > maxLimit;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// Periodic cleanup of rate limit caches every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of enquiryRateLimit) {
    if (now > rec.resetAt) enquiryRateLimit.delete(key);
  }
  for (const [key, rec] of adminLoginAttempts) {
    if (now > rec.resetAt) adminLoginAttempts.delete(key);
  }
}, 600000).unref();

// Security HTTP Headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// -----------------------------------------------------------------------------
// 4. Static File Sandbox & MIME Types
// -----------------------------------------------------------------------------
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const FORBIDDEN_DIRS = ['data', 'node_modules', 'enquiry-backend', 'tools', 'lead-test', '.git'];
const FORBIDDEN_FILES = ['server.js', 'package.json', 'package-lock.json', '.gitignore'];

function isPathForbidden(relPath) {
  const parts = relPath.split(/[/\\]+/).filter(Boolean);
  for (const part of parts) {
    if (part.startsWith('.')) return true; // Block .env, .git, .vscode, etc.
  }
  if (parts.length > 0 && FORBIDDEN_DIRS.includes(parts[0].toLowerCase())) {
    return true;
  }
  if (parts.length === 1 && FORBIDDEN_FILES.includes(parts[0].toLowerCase())) {
    return true;
  }
  return false;
}

// -----------------------------------------------------------------------------
// 5. HTTP Server Request Router
// -----------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const clientIp = getClientIp(req);
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  const sendJson = (status, payload) => {
    res.writeHead(status, {
      ...SECURITY_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify(payload));
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      ...SECURITY_HEADERS,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-key'
    });
    res.end();
    return;
  }

  // --- Public Config API (Safe runtime contact settings) ---
  if (pathname === '/api/config' && req.method === 'GET') {
    sendJson(200, PUBLIC_CONFIG);
    return;
  }

  // --- 1. Customer Enquiry: POST /api/enquiry ---
  if (pathname === '/api/enquiry' && req.method === 'POST') {
    // Rate Limiting: Max 10 submissions per minute per IP
    if (isRateLimited(enquiryRateLimit, clientIp, 10, 60000)) {
      sendJson(429, { error: 'Rate limit exceeded: too many submissions from your IP. Please wait a minute.' });
      return;
    }

    try {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 32768) {
          sendJson(413, { error: 'Payload too large' });
          return;
        }
      }

      let data;
      try {
        data = JSON.parse(body);
      } catch (_) {
        sendJson(400, { error: 'Invalid JSON payload' });
        return;
      }

      // Input Sanitization
      const clean = str => (typeof str === 'string' ? str.replace(/\0/g, '').trim() : '');
      const name = clean(data.name || data.fullName);
      const phone = clean(data.phone);
      const email = clean(data.email);
      const city = clean(data.city);
      const collection = clean(data.collection) || 'General enquiry';
      const designId = clean(data.designId);
      const message = clean(data.message);
      const budget = clean(data.budget);
      const page = clean(data.page) || 'contact.html';
      const honeypot = clean(data.website);

      // Bot protection honeypot
      if (honeypot !== '') {
        sendJson(400, { error: 'Request rejected' });
        return;
      }

      // Field Validations
      if (!name || name.length > 100) {
        sendJson(422, { error: 'Valid customer name is required (max 100 characters)' });
        return;
      }

      const digits = phone.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        sendJson(422, { error: 'Valid phone number is required (7-15 digits)' });
        return;
      }

      if (email && (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        sendJson(422, { error: 'Please enter a valid email address' });
        return;
      }

      const id = crypto.randomUUID();
      const reference = `FE-${id}`;
      const record = {
        id,
        reference,
        created_at: new Date().toISOString(),
        name,
        phone,
        email,
        city: city.slice(0, 100),
        collection: collection.slice(0, 50),
        design_id: designId.slice(0, 50),
        message: message.slice(0, 2000),
        budget: budget.slice(0, 50),
        source_page: page.slice(0, 100),
        status: 'New'
      };

      await saveEnquiry(record);

      // Mirror to Google Apps Script in background if configured in .env
      if (GOOGLE_SCRIPT_URL) {
        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ ...data, requestId: id })
        }).catch(err => {
          console.warn(`[Sync Notice] Mirror to external endpoint skipped: ${err.message}`);
        });
      }

      sendJson(200, {
        saved: true,
        id: reference,
        message: 'Enquiry successfully recorded'
      });
      return;
    } catch (err) {
      console.error('[Enquiry Error]', err);
      sendJson(500, { error: 'Internal server error saving enquiry' });
      return;
    }
  }

  // --- Admin Authentication & Protection ---
  const isAuthorized = () => {
    const authHeader = req.headers['authorization'] || '';
    const keyHeader = req.headers['x-admin-key'] || '';
    const queryKey = parsedUrl.searchParams.get('key') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const candidate = keyHeader || token || queryKey;
    return constantTimeCompare(candidate, ADMIN_PASSWORD);
  };

  if (pathname.startsWith('/api/admin/')) {
    // Brute-force protection: Max 5 failed attempts per 15 minutes
    const attempts = adminLoginAttempts.get(clientIp);
    if (attempts && attempts.count >= 5 && Date.now() < attempts.resetAt) {
      const minutesLeft = Math.ceil((attempts.resetAt - Date.now()) / 60000);
      sendJson(429, { error: `Too many failed admin login attempts. Locked for ${minutesLeft} minute(s).` });
      return;
    }

    if (!isAuthorized()) {
      const now = Date.now();
      if (!attempts || now > attempts.resetAt) {
        adminLoginAttempts.set(clientIp, { count: 1, resetAt: now + 15 * 60 * 1000 });
      } else {
        attempts.count++;
      }
      sendJson(401, { error: 'Unauthorized: invalid admin credentials' });
      return;
    }

    // Reset login attempts on successful authentication
    adminLoginAttempts.delete(clientIp);
  }

  // --- 2. Admin API: GET /api/admin/enquiries ---
  if (pathname === '/api/admin/enquiries' && req.method === 'GET') {
    const items = await getAllEnquiries();
    sendJson(200, { enquiries: items });
    return;
  }

  // --- 3. Admin API: Update Status POST /api/admin/enquiries/status ---
  if (pathname === '/api/admin/enquiries/status' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const { id, status } = JSON.parse(body);
      const cleanId = String(id || '').trim();
      const cleanStatus = String(status || '').trim();
      if (!cleanId || !['New', 'Contacted', 'Closed'].includes(cleanStatus)) {
        sendJson(400, { error: 'Valid ID and status (New, Contacted, Closed) required' });
        return;
      }
      const updated = await updateEnquiryStatus(cleanId, cleanStatus);
      sendJson(200, { success: updated });
    } catch (_) {
      sendJson(400, { error: 'Invalid payload' });
    }
    return;
  }

  // --- 4. Admin API: DELETE /api/admin/enquiries ---
  if (pathname === '/api/admin/enquiries' && req.method === 'DELETE') {
    const id = parsedUrl.searchParams.get('id');
    if (!id || typeof id !== 'string') {
      sendJson(400, { error: 'ID parameter required' });
      return;
    }
    await deleteEnquiry(id.trim());
    sendJson(200, { success: true });
    return;
  }

  // --- 5. Admin API: CSV Export GET /api/admin/export.csv ---
  if (pathname === '/api/admin/export.csv' && req.method === 'GET') {
    const enquiries = await getAllEnquiries();

    const headers = [
      'Reference ID',
      'Date (IST)',
      'Customer Name',
      'Phone Number',
      'Email Address',
      'City / Region',
      'Collection',
      'Design ID',
      'Customer Message',
      'Estimated Budget',
      'Source Page',
      'Status'
    ];

    const escapeCsv = val => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = enquiries.map(e => {
      const d = new Date(e.created_at);
      const formattedDate = isNaN(d) ? e.created_at : d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      return [
        escapeCsv(e.reference),
        escapeCsv(formattedDate),
        escapeCsv(e.name),
        escapeCsv(e.phone),
        escapeCsv(e.email),
        escapeCsv(e.city),
        escapeCsv(e.collection),
        escapeCsv(e.design_id),
        escapeCsv(e.message),
        escapeCsv(e.budget),
        escapeCsv(e.source_page),
        escapeCsv(e.status)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const dateStamp = new Date().toISOString().slice(0, 10);

    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="feality-italy-enquiries-${dateStamp}.csv"`,
      'Cache-Control': 'no-store'
    });
    res.end(csvContent);
    return;
  }

  // --- 6. Static File Serving with Sandboxing ---
  let filePath = pathname === '/' ? '/index.html' : pathname;
  if (filePath === '/admin') filePath = '/admin.html';

  // Decode URI safely
  try {
    filePath = decodeURIComponent(filePath);
  } catch (_) {
    res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  const safePath = path.normalize(path.join(ROOT, filePath));
  const relPath = path.relative(ROOT, safePath);

  // Security Check: Boundary enforcement & forbidden directories/files
  if (!safePath.startsWith(ROOT) || isPathForbidden(relPath)) {
    res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden: Access Denied');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 Not Found</h1><p><a href="/">Return to FEALITY ITALY Home</a></p>');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext];

    if (!contentType) {
      res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden: File type not accessible');
      return;
    }

    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
    });
    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`FEALITY ITALY Server running on http://localhost:${PORT}`);
  console.log(`Admin Portal: http://localhost:${PORT}/admin.html`);
  console.log(`Database: MySQL '${MYSQL_CONFIG.database}' (Port ${MYSQL_CONFIG.port})`);
  console.log(`Security: Static sandbox active, .env protected, rate limiting enabled.`);
  console.log(`====================================================`);
});
