require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const path     = require('path');
const fs       = require('fs');
const logger   = require('./utils/logger');
const adminRoutes = require('./routes/admin');
const {
  startSession, cancelSession, getSession, deleteSession,
  getAllSessions, getAvailableCommands, restoreAllSessions,
} = require('./utils/socket');
const {
  isUserRestricted, addRestrictedUser,
  removeRestrictedUser,
} = require('./utils/restrictions');
const { startChannelCheck } = require('./tasks/channelCheck');

const app  = express();
const PORT = parseInt(process.env.PORT) || 3000;
const HOST = process.env.HOST || 'localhost';

// ── Middleware ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
  const t = Date.now();
  res.on('finish', () => {
    const ms   = Date.now() - t;
    const icon = res.statusCode >= 500 ? '🔴' : res.statusCode >= 400 ? '🟡' : '🟢';
    logger.info(`${icon} ${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'noorx-key-2024',
  resave: false, saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true,
            secure: process.env.NODE_ENV === 'production' },
}));

// ── Public pages ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  const p = path.join(__dirname, '../public/index.html');
  fs.existsSync(p) ? res.sendFile(p) : res.send('<h1 style="color:#25d366;font-family:sans-serif;padding:40px">NOOR-X Running ✅</h1>');
});

app.get('/health', (req, res) => {
  const p = path.join(__dirname, '../public/health.html');
  fs.existsSync(p) ? res.sendFile(p) : res.json({ alive: true });
});

// ── API: Health ───────────────────────────────────────────────────────────
app.get('/api/health/json', (req, res) => {
  try {
    const mem = process.memoryUsage();
    const up  = process.uptime();
    const h = Math.floor(up/3600), m = Math.floor((up%3600)/60), s = Math.floor(up%60);
    res.json({
      success: true, status: 'alive',
      uptime: `${h}h ${m}m ${s}s`, uptime_s: Math.floor(up),
      sessions: getAllSessions().length,
      memory: `${(mem.heapUsed/1024/1024).toFixed(1)} MB`,
      node: process.version, platform: process.platform,
      timestamp: new Date().toISOString(),
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
app.get('/api/health', (req, res) => res.redirect('/api/health/json'));

// ── API: Pair ─────────────────────────────────────────────────────────────
app.post('/api/pair', async (req, res) => {
  try {
    const { userId, phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ success: false, message: '❌ Phone number required' });
    const clean = String(phoneNumber).replace(/\D/g, '');
    if (clean.length < 7) return res.status(400).json({ success: false, message: '❌ Invalid phone number' });
    const uid = userId || `user_${Date.now()}_${clean}`;
    if (isUserRestricted(uid)) return res.status(403).json({ success: false, message: '🚫 Account restricted' });
    logger.info(`📱 Pair request: ${clean} → ${uid}`);
    const result = await startSession(uid, clean);
    if (result?.code && ['code_ready','connected','already_running'].includes(result?.status)) {
      return res.json({ success: true, code: result.code, message: '✅ Enter this code in WhatsApp → Linked Devices', userId: uid, phoneNumber: clean });
    }
    return res.status(400).json({ success: false, message: '❌ Could not generate pairing code. Try again.' });
  } catch (e) {
    logger.error('POST /api/pair:', e.message);
    res.status(500).json({ success: false, message: e.message.includes('TIMEOUT') ? '⏱️ Timed out — try again' : `🔴 ${e.message}` });
  }
});

// ── API: Reset ────────────────────────────────────────────────────────────
app.post('/api/pair/reset', (req, res) => {
  try {
    const { userId } = req.body;
    if (userId) cancelSession(userId);
    res.json({ success: true, message: '✅ Reset — pair again' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── API: Sessions ─────────────────────────────────────────────────────────
app.get('/api/sessions', (req, res) => {
  try { res.json({ success: true, sessions: getAllSessions(), count: getAllSessions().length }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
app.get('/api/session/:userId', (req, res) => {
  try {
    const s = getSession(req.params.userId);
    if (!s) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, phoneNumber: s.phoneNumber, isActive: !!(s.sock?.user), createdAt: s.createdAt });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
app.get('/api/commands', (req, res) => {
  try { res.json({ success: true, commands: getAvailableCommands(), prefix: process.env.BOT_PREFIX||'!' }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Admin API ─────────────────────────────────────────────────────────────
const requireAdmin = (req, res, next) =>
  req.session?.adminAuth ? next() : res.status(401).json({ success: false, message: 'Unauthorized' });

app.post('/api/admin/delete-user', requireAdmin, (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    res.json({ success: true, message: deleteSession(userId) ? `✅ Deleted ${userId}` : `ℹ️ No session` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
app.post('/api/admin/ban-user', requireAdmin, (req, res) => {
  try {
    const { userId, reason } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    addRestrictedUser(userId, reason || 'Banned by admin');
    deleteSession(userId);
    res.json({ success: true, message: `🔨 ${userId} banned` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
app.post('/api/admin/restrict-user', requireAdmin, (req, res) => {
  try {
    const { userId, reason } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    addRestrictedUser(userId, reason || 'Restricted');
    deleteSession(userId);
    res.json({ success: true, message: `🚫 ${userId} restricted` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
app.post('/api/admin/unrestrict-user', requireAdmin, (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    removeRestrictedUser(userId);
    res.json({ success: true, message: `✅ ${userId} unrestricted` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
app.post('/api/admin/add-user', requireAdmin, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ success: false, message: 'phoneNumber required' });
    const clean = phoneNumber.replace(/\D/g,'');
    const uid = `admin_${Date.now()}_${clean}`;
    await startSession(uid, clean);
    res.json({ success: true, message: `✅ Session started for ${clean}`, userId: uid });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
app.post('/api/admin/broadcast', requireAdmin, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'message required' });
    const all = getAllSessions(); let ok=0,fail=0;
    for (const s of all) {
      const sess = getSession(s.userId);
      if (!sess?.sock?.user) { fail++; continue; }
      try {
        await sess.sock.sendMessage(sess.sock.user.id.split(':')[0]+'@s.whatsapp.net', { text: message });
        ok++;
      } catch (e) { fail++; }
    }
    res.json({ success: true, message: `✅ Sent: ${ok}, Failed: ${fail}` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── Admin UI ──────────────────────────────────────────────────────────────
app.use('/admin', adminRoutes);

// ── 404 & error ───────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Not found: ${req.path}` }));
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Startup ───────────────────────────────────────────────────────────────
const server = app.listen(PORT, HOST, async () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`\x1b[32m
╔══════════════════════════════════════════════════════╗
║       🚀 NOOR-X BOT SERVER STARTED 🚀               ║
╠══════════════════════════════════════════════════════╣
║  📱 Pairing:  \x1b[0m${url.padEnd(39)}\x1b[32m║
║  🔐 Admin:    \x1b[0m${(url+'/admin').padEnd(39)}\x1b[32m║
║  💊 Health:   \x1b[0m${(url+'/health').padEnd(39)}\x1b[32m║
╚══════════════════════════════════════════════════════╝\x1b[0m`);

  // ── Restore previously connected sessions FIRST ──────────────────────
  try {
    await restoreAllSessions();
  } catch (e) {
    logger.error('Session restore failed:', e.message);
  }

  // ── Start channel check task ─────────────────────────────────────────
  try { startChannelCheck(); }
  catch (e) { logger.error('startChannelCheck failed:', e.message); }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') logger.error(`❌ Port ${PORT} already in use — change PORT in .env`);
  else logger.error('Server error:', e.message);
  process.exit(1);
});

// ── Crash protection ──────────────────────────────────────────────────────
process.on('SIGTERM', () => { logger.info('SIGTERM — shutting down'); server.close(() => process.exit(0)); });
process.on('SIGINT',  () => { logger.info('SIGINT — shutting down');  server.close(() => process.exit(0)); });

process.on('unhandledRejection', (reason) => {
  logger.error('⚠️  Unhandled Rejection:', reason instanceof Error ? reason.stack : String(reason));
  // DO NOT exit — log and continue
});

process.on('uncaughtException', (err) => {
  logger.error('🔴 Uncaught Exception:', err.stack || err.message);
  // Only exit for truly fatal errors — not command/network errors
  const fatal = ['EACCES','EADDRINUSE','MODULE_NOT_FOUND'];
  if (fatal.some(c => err.code === c || err.message.includes(c))) process.exit(1);
  // Otherwise log and keep running
});

module.exports = app;
