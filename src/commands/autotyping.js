const settings = require('../utils/settings');
module.exports = {
  name: 'autotyping',
  category: 'auto',
  description: 'Toggle typing indicator on every message',
  execute: async (sock, msg, args, userId) => {
    const jid = msg.key.remoteJid;
    const key = `autotyping:${userId}`;
    const now = settings.toggle(key);
    await sock.sendMessage(jid, {
      text: `〔 ✧ ɴᴏᴏʀ-x ✧ 〕\n┏━━━━━━━━━━━━━━━━━▣\n┃ ✍️  *ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ*\n┠───────────────────\n┃ Status: *${now ? '🟢 ENABLED' : '🔴 DISABLED'}*\n┗━━━━━━━━━━━━━━━━━▣`
    });
  }
};
