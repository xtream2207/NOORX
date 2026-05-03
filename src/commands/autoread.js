const settings = require('../utils/settings');
module.exports = {
  name: 'autoread',
  category: 'auto',
  description: 'Toggle auto-read messages',
  execute: async (sock, msg, args, userId) => {
    const jid = msg.key.remoteJid;
    const key = `autoread:${userId}`;
    const now = settings.toggle(key);
    await sock.sendMessage(jid, {
      text: `〔 ✧ ɴᴏᴏʀ-x ✧ 〕\n┏━━━━━━━━━━━━━━━━━▣\n┃ 👁️  *ᴀᴜᴛᴏ ʀᴇᴀᴅ*\n┠───────────────────\n┃ Status: *${now ? '🟢 ENABLED' : '🔴 DISABLED'}*\n┗━━━━━━━━━━━━━━━━━▣\n_Messages will ${now ? 'now be' : 'no longer be'} auto-read._`
    });
  }
};
