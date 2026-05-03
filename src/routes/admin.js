const express = require('express');
const router = express.Router();
const { getSession, deleteSession, getAllSessions, startSession } = require('../utils/socket');
const { addRestrictedUser, removeRestrictedUser, isUserRestricted, getRestrictedUsers } = require('../utils/restrictions');
const logger = require('../utils/logger');

const ADMIN_USER  = process.env.ADMIN_USER  || 'admin';
const ADMIN_PASS  = process.env.ADMIN_PASS  || 'noorx2024';
const AUTH_KEY    = process.env.ADMIN_AUTH_KEY || 'NOOR7';   // Step-2 key

// ── helpers ────────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (!req.session?.adminAuth) return res.redirect('/admin/login');
  next();
}

function page(title, body, extraHead = '') {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — NOOR-X Admin</title>
${extraHead}
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--g:#25d366;--b:#3b82f6;--r:#ef4444;--y:#f59e0b;--dark:#0b1117;--card:rgba(15,22,35,.95)}
body{font-family:'Segoe UI',sans-serif;background:linear-gradient(-45deg,#060d14,#0b1a2e,#060d14);
  min-height:100vh;color:#e2e8f0;padding:0}
a{color:var(--b);text-decoration:none}
a:hover{text-decoration:underline}

/* nav */
.nav{background:rgba(10,16,28,.97);border-bottom:1px solid rgba(37,211,102,.15);
  padding:14px 20px;display:flex;align-items:center;justify-content:space-between;
  position:sticky;top:0;z-index:100}
.nav-brand{font-size:1.1rem;font-weight:800;
  background:linear-gradient(90deg,var(--g),var(--b));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.nav-links{display:flex;gap:10px;align-items:center}
.nav-links a{font-size:.85rem;color:#94a3b8}
.nav-links a:hover{color:#fff}

/* layout */
.wrap{max-width:1100px;margin:0 auto;padding:24px 16px}

/* stat cards */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:24px}
.stat{background:var(--card);border:1px solid rgba(37,211,102,.15);border-radius:14px;
  padding:18px;text-align:center}
.stat-n{font-size:2.2rem;font-weight:900;
  background:linear-gradient(90deg,var(--g),var(--b));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.stat-l{font-size:.72rem;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-top:4px}

/* section */
.sec{background:var(--card);border:1px solid rgba(255,255,255,.06);
  border-radius:14px;padding:22px;margin-bottom:20px}
.sec-title{font-size:1rem;font-weight:700;color:var(--g);margin-bottom:16px;
  padding-bottom:10px;border-bottom:1px solid rgba(37,211,102,.15)}

/* table */
table{width:100%;border-collapse:collapse;font-size:.85rem}
th{background:rgba(37,211,102,.06);color:#64748b;padding:10px 12px;text-align:left;
  border-bottom:1px solid rgba(255,255,255,.05);font-size:.75rem;text-transform:uppercase;letter-spacing:.5px}
td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.02)}
.badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:.75rem;font-weight:700}
.badge-on {background:rgba(37,211,102,.15);color:#25d366;border:1px solid rgba(37,211,102,.3)}
.badge-off{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3)}

/* action buttons */
.actions{display:flex;gap:6px;flex-wrap:wrap}
.btn{border:none;border-radius:8px;padding:7px 13px;font-size:.78rem;font-weight:700;
  cursor:pointer;transition:opacity .15s,transform .1s;white-space:nowrap}
.btn:active{transform:scale(.96)}
.btn:hover{opacity:.85}
.btn-del  {background:rgba(239,68,68,.2);color:#f87171;border:1px solid rgba(239,68,68,.3)}
.btn-ban  {background:rgba(239,68,68,.7);color:#fff}
.btn-res  {background:rgba(245,158,11,.2);color:#fbbf24;border:1px solid rgba(245,158,11,.3)}
.btn-ok   {background:rgba(37,211,102,.2);color:#25d366;border:1px solid rgba(37,211,102,.3)}
.btn-blue {background:rgba(59,130,246,.2);color:#60a5fa;border:1px solid rgba(59,130,246,.3)}

/* forms */
.row{display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap}
input[type=text],input[type=password],textarea,select{
  flex:1;min-width:140px;padding:10px 12px;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  border-radius:8px;color:#fff;font-size:.875rem;outline:none;
  transition:border-color .2s}
input:focus,textarea:focus{border-color:var(--g);box-shadow:0 0 0 2px rgba(37,211,102,.1)}
textarea{min-height:80px;resize:vertical;font-family:inherit;width:100%}
.btn-submit{background:linear-gradient(90deg,var(--g),#128c7e);color:#fff;
  padding:10px 22px;border:none;border-radius:8px;font-weight:700;cursor:pointer}
.btn-submit:hover{opacity:.85}

/* auth card */
.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;
  background:linear-gradient(-45deg,#060d14,#0b1a2e,#060d14)}
.auth-card{background:var(--card);border:1px solid rgba(37,211,102,.2);border-radius:20px;
  padding:40px 32px;width:100%;max-width:380px;text-align:center}
.auth-title{font-size:1.6rem;font-weight:900;
  background:linear-gradient(90deg,var(--g),var(--b));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:6px}
.auth-sub{color:#64748b;font-size:.85rem;margin-bottom:28px}
.auth-card label{display:block;text-align:left;font-size:.8rem;color:#94a3b8;font-weight:600;margin-bottom:6px}
.auth-card input{width:100%;margin-bottom:14px}
.auth-btn{width:100%;padding:12px;background:linear-gradient(90deg,var(--g),#128c7e);
  border:none;border-radius:10px;color:#fff;font-weight:700;font-size:.95rem;cursor:pointer}
.auth-btn:hover{opacity:.85}
.err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#f87171;
  border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:.85rem}
.info-badge{background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);color:#60a5fa;
  border-radius:8px;padding:8px 12px;margin-bottom:18px;font-size:.82rem}
</style></head>
<body>${body}</body></html>`;
}

// ── STEP 1: Login ───────────────────────────────────────────────────────────
router.get('/login', (req, res) => {
  if (req.session?.adminAuth) return res.redirect('/admin/dashboard');
  const err = req.query.err ? `<div class="err">${decodeURIComponent(req.query.err)}</div>` : '';
  res.send(page('Login', `
  <div class="auth-wrap">
    <div class="auth-card">
      <div style="font-size:2.5rem;margin-bottom:12px">🔐</div>
      <div class="auth-title">NOOR-X Admin</div>
      <div class="auth-sub">Enter your credentials to continue</div>
      ${err}
      <form method="POST" action="/admin/login">
        <label>Username</label>
        <input type="text" name="username" placeholder="admin" required autocomplete="username">
        <label>Password</label>
        <input type="password" name="password" placeholder="••••••••" required autocomplete="current-password">
        <button class="auth-btn" type="submit">Continue →</button>
      </form>
    </div>
  </div>`));
});

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.redirect('/admin/login?err=' + encodeURIComponent('All fields required'));
    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      req.session.adminStep1 = true;
      return res.redirect('/admin/verify-key');
    }
    logger.warn(`Failed admin login attempt for "${username}"`);
    res.redirect('/admin/login?err=' + encodeURIComponent('❌ Invalid credentials'));
  } catch (err) {
    logger.error('Login error:', err.message);
    res.redirect('/admin/login?err=' + encodeURIComponent('Server error'));
  }
});

// ── STEP 2: Auth key ────────────────────────────────────────────────────────
router.get('/verify-key', (req, res) => {
  if (!req.session?.adminStep1) return res.redirect('/admin/login');
  if (req.session?.adminAuth)   return res.redirect('/admin/dashboard');
  const err = req.query.err ? `<div class="err">${decodeURIComponent(req.query.err)}</div>` : '';
  res.send(page('Verify Key', `
  <div class="auth-wrap">
    <div class="auth-card">
      <div style="font-size:2.5rem;margin-bottom:12px">🔑</div>
      <div class="auth-title">Authentication Key</div>
      <div class="auth-sub">Enter the secret authentication key to access the dashboard</div>
      <div class="info-badge">🛡️ Two-factor verification required</div>
      ${err}
      <form method="POST" action="/admin/verify-key">
        <label>Authentication Key</label>
        <input type="password" name="authkey" placeholder="Enter auth key" required autocomplete="off">
        <button class="auth-btn" type="submit">🔓 Unlock Dashboard</button>
      </form>
      <p style="margin-top:14px;font-size:.78rem;color:#374151">
        <a href="/admin/login">← Back to login</a>
      </p>
    </div>
  </div>`));
});

router.post('/verify-key', (req, res) => {
  try {
    if (!req.session?.adminStep1) return res.redirect('/admin/login');
    const { authkey } = req.body;
    if (!authkey) return res.redirect('/admin/verify-key?err=' + encodeURIComponent('Key required'));
    if (authkey.trim() === AUTH_KEY) {
      req.session.adminAuth  = true;
      req.session.adminStep1 = false;
      logger.info('✅ Admin authenticated successfully');
      return res.redirect('/admin/dashboard');
    }
    logger.warn('❌ Wrong admin auth key attempt');
    res.redirect('/admin/verify-key?err=' + encodeURIComponent('❌ Invalid authentication key'));
  } catch (err) {
    logger.error('Verify key error:', err.message);
    res.redirect('/admin/verify-key?err=' + encodeURIComponent('Server error'));
  }
});

// ── DASHBOARD ───────────────────────────────────────────────────────────────
router.get('/dashboard', requireAdmin, (req, res) => {
  try {
    const sessions  = getAllSessions();
    const restricted = getRestrictedUsers();
    const active    = sessions.filter(s => s.isActive).length;
    const msg       = req.query.msg ? `<div style="background:rgba(37,211,102,.1);border:1px solid rgba(37,211,102,.3);color:#25d366;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:.85rem">${decodeURIComponent(req.query.msg)}</div>` : '';

    const sessionRows = sessions.map(s => `
      <tr>
        <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.78rem;color:#94a3b8">${s.userId}</td>
        <td><strong>${s.phoneNumber}</strong></td>
        <td><span class="badge ${s.isActive ? 'badge-on' : 'badge-off'}">${s.isActive ? '🟢 Active' : '🔴 Inactive'}</span></td>
        <td style="font-size:.75rem;color:#64748b">${s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}</td>
        <td>
          <div class="actions">
            <button class="btn btn-ban"  onclick="banUser('${s.userId}')">🔨 Ban</button>
            <button class="btn btn-res"  onclick="restrictUser('${s.userId}')">🚫 Restrict</button>
            <button class="btn btn-del"  onclick="deleteUser('${s.userId}')">🗑️ Delete</button>
          </div>
        </td>
      </tr>`).join('') || `<tr><td colspan="5" style="text-align:center;padding:24px;color:#374151">No connected users</td></tr>`;

    const restrictedRows = restricted.map(u => `
      <tr>
        <td style="font-size:.8rem">${u.userId}</td>
        <td>${u.reason || '—'}</td>
        <td style="font-size:.75rem;color:#64748b">${u.restrictedAt ? new Date(u.restrictedAt).toLocaleString() : '—'}</td>
        <td><button class="btn btn-ok" onclick="unrestrictUser('${u.userId}')">✅ Unrestrict</button></td>
      </tr>`).join('') || `<tr><td colspan="4" style="text-align:center;padding:20px;color:#374151">No restricted users</td></tr>`;

    res.send(page('Dashboard', `
    <nav class="nav">
      <span class="nav-brand">🔐 NOOR-X Admin Dashboard</span>
      <div class="nav-links">
        <a href="/">Pairing Page</a>
        <a href="/health">Health</a>
        <a href="/admin/logout" style="color:#f87171">Logout</a>
      </div>
    </nav>
    <div class="wrap">
      ${msg}
      <div class="stats">
        <div class="stat"><div class="stat-n">${sessions.length}</div><div class="stat-l">Total Users</div></div>
        <div class="stat"><div class="stat-n" style="background:linear-gradient(90deg,#25d366,#22c55e);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${active}</div><div class="stat-l">Active Sessions</div></div>
        <div class="stat"><div class="stat-n" style="background:linear-gradient(90deg,#ef4444,#f87171);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${restricted.length}</div><div class="stat-l">Restricted Users</div></div>
        <div class="stat"><div class="stat-n" style="background:linear-gradient(90deg,#f59e0b,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${Math.floor(process.uptime())}s</div><div class="stat-l">Uptime</div></div>
      </div>

      <div class="sec">
        <div class="sec-title">👥 Connected Users</div>
        <div style="overflow-x:auto">
          <table>
            <thead><tr><th>User ID</th><th>Phone</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>${sessionRows}</tbody>
          </table>
        </div>
      </div>

      <div class="sec">
        <div class="sec-title">➕ Add User Manually</div>
        <div class="row">
          <input type="text" id="addPhone" placeholder="Phone number e.g. 256747304196">
          <button class="btn-submit" onclick="addUser()">Add User</button>
        </div>
      </div>

      <div class="sec">
        <div class="sec-title">📢 Broadcast Message</div>
        <textarea id="broadcastMsg" placeholder="Enter message to send to all connected users..."></textarea>
        <button class="btn-submit" style="margin-top:10px;width:100%" onclick="broadcast()">Send to All</button>
      </div>

      <div class="sec">
        <div class="sec-title">🚫 Restricted / Banned Users</div>
        <div style="overflow-x:auto">
          <table>
            <thead><tr><th>User ID</th><th>Reason</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>${restrictedRows}</tbody>
          </table>
        </div>
      </div>
    </div>

    <script>
    async function api(url, body) {
      try {
        const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
        return await r.json();
      } catch(e) { return { success:false, message: e.message }; }
    }

    async function banUser(userId) {
      if (!confirm('⛔ BAN this user permanently? They will be restricted and their session deleted.')) return;
      const reason = prompt('Ban reason (optional):') || 'Banned by admin';
      const d = await api('/api/admin/ban-user', { userId, reason });
      alert(d.message || (d.success ? '✅ User banned' : '❌ Failed'));
      location.reload();
    }

    async function deleteUser(userId) {
      if (!confirm('Delete this user session?')) return;
      const d = await api('/api/admin/delete-user', { userId });
      alert(d.message);
      location.reload();
    }

    async function restrictUser(userId) {
      const reason = prompt('Restriction reason:');
      if (!reason) return;
      const d = await api('/api/admin/restrict-user', { userId, reason });
      alert(d.message);
      location.reload();
    }

    async function unrestrictUser(userId) {
      const d = await api('/api/admin/unrestrict-user', { userId });
      alert(d.message);
      location.reload();
    }

    async function addUser() {
      const phone = document.getElementById('addPhone').value.trim();
      if (!phone) return alert('Enter a phone number');
      const d = await api('/api/admin/add-user', { phoneNumber: phone });
      alert(d.message);
      location.reload();
    }

    async function broadcast() {
      const msg = document.getElementById('broadcastMsg').value.trim();
      if (!msg) return alert('Enter a message');
      const d = await api('/api/admin/broadcast', { message: msg });
      alert(d.message);
      document.getElementById('broadcastMsg').value = '';
    }

    // Auto-refresh stats every 30s
    setTimeout(() => location.reload(), 30000);
    </script>`));
  } catch (err) {
    logger.error('Dashboard render error:', err.message);
    res.status(500).send('Dashboard error: ' + err.message);
  }
});

// ── LOGOUT ──────────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

module.exports = router;
