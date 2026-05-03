const makeWASocket = require('@whiskeysockets/baileys').default;
const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');
const logger   = require('./logger');
const settings = require('./settings');
const fs       = require('fs');
const path     = require('path');

const sessions  = {};
const commands  = new Map();
const PREFIX    = process.env.BOT_PREFIX || '!';
const SESS_ROOT = path.join(__dirname, '../../sessions');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Load commands ─────────────────────────────────────────────────────────
function loadCommands() {
  const dir = path.join(__dirname, '../commands');
  try {
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); return; }
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const fp = path.join(dir, file);
        delete require.cache[require.resolve(fp)];
        const cmd = require(fp);
        if (!cmd?.name || typeof cmd.execute !== 'function') {
          logger.warn(`Skipping ${file} — missing name or execute`); continue;
        }
        commands.set(cmd.name.toLowerCase(), cmd);
        logger.info(`✅ Command loaded: ${cmd.name}`);
      } catch (e) { logger.error(`Failed loading command ${file}:`, e.message); }
    }
    logger.info(`📦 Total commands loaded: ${commands.size}`);
  } catch (e) { logger.error('loadCommands error:', e.message); }
}
loadCommands();

function getAvailableCommands() {
  return [...commands.entries()].map(([name, cmd]) => ({
    name, description: cmd.description || 'No description',
  }));
}

// ── Always-Online keep-alive ──────────────────────────────────────────────
function startAlwaysOnline(sock, userId) {
  let alive = true;
  const iv = setInterval(async () => {
    if (!alive) { clearInterval(iv); return; }
    try { await sock.sendPresenceUpdate('available'); } catch (_) {}
  }, 25_000);
  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'close') { alive = false; clearInterval(iv); }
  });
  logger.info(`🌍 Always-Online started for ${userId}`);
}

// ── Save / read session meta (phone number, createdAt) ───────────────────
function saveMeta(userId, phoneNumber) {
  const dir = path.join(SESS_ROOT, userId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'meta.json'),
    JSON.stringify({ phoneNumber, createdAt: new Date().toISOString() })
  );
}
function readMeta(userId) {
  try {
    const p = path.join(SESS_ROOT, userId, 'meta.json');
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  } catch (_) { return null; }
}

// ── Wipe a session folder (fresh pair request) ────────────────────────────
function wipeSession(userId) {
  const dir = path.join(SESS_ROOT, userId);
  try {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) { logger.warn(`wipeSession [${userId}]:`, e.message); }
}

// ── Fetch Baileys version (cached for the process lifetime) ───────────────
let _version = null;
async function getVersion() {
  if (_version) return _version;
  try {
    const r = await fetchLatestBaileysVersion();
    _version = r.version;
    logger.info(`Baileys version: ${_version.join('.')}`);
  } catch (_) {
    _version = [2, 3000, 1015901893];
    logger.warn('Using fallback Baileys version');
  }
  return _version;
}

// ═════════════════════════════════════════════════════════════════════════
// createSocket — the single socket factory used by BOTH pairing AND restore.
//
// opts.onCode(code)  → called once when pairing code is ready
// opts.onOpen()      → called when connection is authenticated
// opts.onFail(err)   → called on unrecoverable error
// opts.requestCode   → whether to request a pairing code on first connect
// ═════════════════════════════════════════════════════════════════════════
async function createSocket(userId, phoneNumber, sessDir, opts = {}) {
  const version     = await getVersion();
  const { state, saveCreds } = await useMultiFileAuthState(sessDir);
  const baileysLogger = logger.child();

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, baileysLogger),
    },
    logger: baileysLogger,
    version,
    browser: Browsers.ubuntu('Chrome'),
    keepAliveIntervalMs: 20_000,
    syncFullHistory: false,
    connectTimeoutMs: 60_000,
    // maxRetries: 0 — we handle reconnect manually so we stay in control
    maxRetries: 0,
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 0,
    retryRequestDelayMs: 500,
  });

  // Update socket reference in sessions map
  if (sessions[userId]) {
    sessions[userId].sock = sock;
  } else {
    sessions[userId] = { sock, phoneNumber, createdAt: new Date(), code: null, isActive: false };
  }

  sock.ev.on('creds.update', () =>
    saveCreds().catch(e => logger.error(`saveCreds [${userId}]:`, e.message)));

  let codeRequested = false;

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    // ── Request pairing code on first 'connecting' ───────────────────────
    if (connection === 'connecting' && opts.requestCode && !codeRequested) {
      codeRequested = true;
      // 1.5 s delay — WebSocket handshake must be complete before requesting
      setTimeout(async () => {
        try {
          const clean = phoneNumber.replace(/\D/g, '');
          logger.info(`🔑 [${userId}] Requesting pairing code for ${clean}...`);
          const code = await sock.requestPairingCode(clean);
          if (!code) throw new Error('Empty code returned');
          logger.success(`🔑 [${userId}] Code ready: ${code}`);
          if (sessions[userId]) sessions[userId].code = code;
          if (opts.onCode) opts.onCode(code);
        } catch (e) {
          logger.error(`[${userId}] requestPairingCode failed:`, e.message);
          if (opts.onFail) opts.onFail(new Error('Could not get pairing code: ' + e.message));
        }
      }, 1500);
    }

    // ── Fully authenticated ──────────────────────────────────────────────
    if (connection === 'open') {
      logger.success(`✅ [${userId}] Authenticated! JID: ${sock.user?.id}`);
      if (sessions[userId]) sessions[userId].isActive = true;
      startAlwaysOnline(sock, userId);
      if (opts.onOpen) opts.onOpen();
    }

    // ── Disconnected ─────────────────────────────────────────────────────
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const reason = Object.keys(DisconnectReason)
        .find(k => DisconnectReason[k] === statusCode) || statusCode || 'unknown';

      if (sessions[userId]) sessions[userId].isActive = false;

      // 428 / connectionClosed — EXPECTED after pairing code is sent.
      // ▶ CRITICAL FIX: Reconnect immediately so WhatsApp can authenticate
      //   when the user enters the code on their phone.
      if (statusCode === 428 || statusCode === 408) {
        logger.info(`[${userId}] WA closed connection after code (${statusCode}) — reconnecting for auth...`);
        await sleep(2000);
        // Reconnect WITHOUT requesting another code — just wait for auth
        createSocket(userId, phoneNumber, sessDir, {
          requestCode: false,
          onOpen: opts.onOpen,
          onFail: opts.onFail,
        }).catch(e => logger.error(`[${userId}] Reconnect failed:`, e.message));
        return;
      }

      // Logged out — wipe and stop
      if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
        logger.warn(`[${userId}] Logged out — removing session`);
        if (sessions[userId]) delete sessions[userId];
        if (opts.onFail) opts.onFail(new Error('Logged out'));
        return;
      }

      // Other disconnects (network glitch, timeout) — retry after delay
      logger.warn(`🔌 [${userId}] Disconnected: ${reason} (${statusCode}) — retry in 5s`);
      await sleep(5000);
      if (!sessions[userId]) return; // session was deleted (cancelled by user)
      createSocket(userId, phoneNumber, sessDir, {
        requestCode: false,
        onOpen: opts.onOpen,
        onFail: opts.onFail,
      }).catch(e => logger.error(`[${userId}] Retry failed:`, e.message));
    }
  });

  sock.ev.on('error', e => logger.error(`Socket error [${userId}]:`, e?.message || e));

  // ── Message handler ───────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      try { await handleMessage(sock, msg, userId); }
      catch (e) { logger.error(`handleMessage crash [${userId}]:`, e.message); }
    }
  });

  return sock;
}

// ── startSession — pair a new user ───────────────────────────────────────
async function startSession(userId, phoneNumber) {
  if (!userId || !phoneNumber) throw new Error('userId and phoneNumber are required');

  if (sessions[userId]) {
    logger.warn(`[${userId}] Existing session — cancelling before restart`);
    cancelSession(userId);
    await sleep(800);
  }

  // Wipe stale credentials (prevents 401 "Connection Closed" on first attempt)
  wipeSession(userId);
  saveMeta(userId, phoneNumber);

  const sessDir = path.join(SESS_ROOT, userId);

  return new Promise((resolve, reject) => {
    let settled = false;

    function settle(fn, val) {
      if (settled) return;
      settled = true;
      fn(val);
    }

    // 90-second overall timeout
    const tout = setTimeout(() => {
      logger.warn(`[${userId}] Pairing timeout (90s)`);
      cancelSession(userId);
      settle(reject, new Error('PAIRING_TIMEOUT — try again'));
    }, 90_000);

    createSocket(userId, phoneNumber, sessDir, {
      requestCode: true,

      // ✅ Return code to caller immediately — don't wait for 'open'
      onCode: (code) => {
        clearTimeout(tout);
        settle(resolve, { code, userId, phoneNumber, status: 'code_ready' });
      },

      // 'open' fires AFTER user enters code — session is now live
      onOpen: () => {
        clearTimeout(tout);
        // Already resolved with code_ready, this just logs
        logger.success(`[${userId}] Session fully authenticated and live`);
      },

      onFail: (err) => {
        clearTimeout(tout);
        cancelSession(userId);
        settle(reject, err);
      },
    }).catch(e => {
      clearTimeout(tout);
      settle(reject, e);
    });
  });
}

// ── restoreAllSessions — called on bot startup ────────────────────────────
async function restoreAllSessions() {
  if (!fs.existsSync(SESS_ROOT)) return;
  const dirs = fs.readdirSync(SESS_ROOT);
  let restored = 0;

  for (const userId of dirs) {
    try {
      const sessDir = path.join(SESS_ROOT, userId);
      if (!fs.statSync(sessDir).isDirectory()) continue;

      // Must have creds.json (valid saved session)
      const credsPath = path.join(sessDir, 'creds.json');
      if (!fs.existsSync(credsPath)) continue;

      const meta = readMeta(userId);
      const phoneNumber = meta?.phoneNumber || 'unknown';

      logger.info(`♻️  Restoring session: ${userId} (${phoneNumber})`);

      // Register placeholder so createSocket can update it
      sessions[userId] = { sock: null, phoneNumber, createdAt: meta?.createdAt ? new Date(meta.createdAt) : new Date(), code: null, isActive: false };

      await createSocket(userId, phoneNumber, sessDir, {
        requestCode: false, // credentials already exist — no new code needed
        onOpen: () => logger.success(`♻️  [${userId}] Session restored!`),
        onFail: (e) => {
          logger.error(`♻️  [${userId}] Restore failed:`, e.message);
          if (sessions[userId]) delete sessions[userId];
        },
      });

      restored++;
      await sleep(1500); // stagger to avoid rate limiting
    } catch (e) {
      logger.error(`Failed to restore session ${userId}:`, e.message);
    }
  }

  if (restored > 0) logger.success(`♻️  Restored ${restored} session(s)`);
}

// ── cancelSession ─────────────────────────────────────────────────────────
function cancelSession(userId) {
  if (!sessions[userId]) return false;
  try { sessions[userId].sock?.end?.(); } catch (_) {}
  delete sessions[userId];
  logger.info(`🔄 Session cancelled: ${userId}`);
  return true;
}

// ── handleMessage ─────────────────────────────────────────────────────────
async function handleMessage(sock, msg, userId) {
  try {
    if (!msg?.message || msg.key?.fromMe) return;
    const jid = msg.key.remoteJid;
    if (!jid) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption || '';

    // Auto-read toggle
    if (settings.get(`autoread:${userId}`)) {
      await sock.readMessages([msg.key]).catch(() => {});
    }

    // Auto-react toggle
    if (settings.get(`autoreact:${userId}`) && text) {
      const emojis = ['👍','❤️','🔥','😂','✅','🎉','💯','⚡'];
      const emoji  = emojis[Math.floor(Math.random() * emojis.length)];
      await sock.sendMessage(jid, { react: { text: emoji, key: msg.key } }).catch(() => {});
    }

    // Anti-link (groups only)
    if (jid.endsWith('@g.us') && settings.get(`antilink:${jid}`)) {
      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/[^\s]+|chat\.whatsapp\.com\/[^\s]+)/i;
      if (urlRegex.test(text)) {
        await sock.sendMessage(jid, { delete: msg.key }).catch(() => {});
        await sock.sendMessage(jid, { text: '🚫 Links are not allowed in this group.' }).catch(() => {});
        return;
      }
    }

    // Anti-badword (groups only)
    if (jid.endsWith('@g.us') && settings.get(`antibadword:${jid}`)) {
      const badwords = (settings.get(`badwords:${jid}`, '') || '').split(',').filter(Boolean);
      if (badwords.some(w => text.toLowerCase().includes(w.toLowerCase()))) {
        await sock.sendMessage(jid, { delete: msg.key }).catch(() => {});
        await sock.sendMessage(jid, { text: '🚫 Please watch your language!' }).catch(() => {});
        return;
      }
    }

    // Auto-typing / auto-recording indicators
    if (text && settings.get(`autotyping:${userId}`)) {
      await sock.sendPresenceUpdate('composing', jid).catch(() => {});
      setTimeout(() => sock.sendPresenceUpdate('paused', jid).catch(() => {}), 2000);
    }
    if (text && settings.get(`autorecording:${userId}`)) {
      await sock.sendPresenceUpdate('recording', jid).catch(() => {});
      setTimeout(() => sock.sendPresenceUpdate('paused', jid).catch(() => {}), 2000);
    }

    if (!text?.startsWith(PREFIX)) return;

    const parts   = text.slice(PREFIX.length).trim().split(/\s+/);
    const cmdName = parts.shift().toLowerCase();
    const args    = parts;
    const cmd     = commands.get(cmdName);

    if (!cmd) {
      await sock.sendMessage(jid, {
        text: `❌ Unknown command: *${PREFIX}${cmdName}*\nType *${PREFIX}menu* to see all commands.`,
      }).catch(() => {});
      return;
    }

    logger.info(`⚡ [${userId}] CMD: ${PREFIX}${cmdName} ${args.join(' ')}`);
    try { await cmd.execute(sock, msg, args, userId); }
    catch (cmdErr) {
      logger.error(`Command "${cmdName}" failed:`, cmdErr.message);
      await sock.sendMessage(jid, { text: `⚠️ Command failed: ${cmdErr.message}` }).catch(() => {});
    }
  } catch (e) { logger.error('handleMessage error:', e.message); }
}

// ── Other helpers ─────────────────────────────────────────────────────────
function getSession(userId)  { return sessions[userId] || null; }

function deleteSession(userId) {
  if (!sessions[userId]) return false;
  try { sessions[userId].sock?.end?.(); } catch (_) {}
  delete sessions[userId];
  logger.info(`🗑️ Session deleted: ${userId}`);
  return true;
}

function getAllSessions() {
  try {
    return Object.keys(sessions).map(uid => ({
      userId:      uid,
      phoneNumber: sessions[uid]?.phoneNumber || '—',
      createdAt:   sessions[uid]?.createdAt   || null,
      isActive:    !!(sessions[uid]?.sock?.user),
      jid:         sessions[uid]?.sock?.user?.id || null,
    }));
  } catch (e) { logger.error('getAllSessions error:', e.message); return []; }
}

module.exports = {
  startSession, cancelSession, getSession, deleteSession,
  getAllSessions, restoreAllSessions, sessions, commands,
  getAvailableCommands, loadCommands, PREFIX,
};
