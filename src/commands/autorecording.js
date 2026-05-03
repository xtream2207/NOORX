const settings = require('../utils/settings');
module.exports = {
  name: 'autorecording',
  category: 'auto',
  description: 'Toggle recording indicator on every message',
  execute: async (sock, msg, args, userId) => {
    const jid = msg.key.remoteJid;
    const key = `autorecording:${userId}`;
    const now = settings.toggle(key);
    await sock.sendMessage(jid, {
      text: `〔 ✧ ɴᴏᴏʀ-x ✧ 〕\n┏━━━━━━━━━━━━━━━━━▣\n┃ 🎙️  *ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ*\n┠───────────────────\n┃ Status: *${now ? '🟢 ENABLED' : '🔴 DISABLED'}*\n┗━━━━━━━━━━━━━━━━━▣`
    });
  }
};
