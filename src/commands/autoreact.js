const settings = require('../utils/settings');
module.exports = {
  name: 'autoreact',
  category: 'auto',
  description: 'Toggle auto-react to messages',
  execute: async (sock, msg, args, userId) => {
    const jid = msg.key.remoteJid;
    const key = `autoreact:${userId}`;
    const now = settings.toggle(key);
    await sock.sendMessage(jid, {
      text: `〔 ✧ ɴᴏᴏʀ-x ✧ 〕\n┏━━━━━━━━━━━━━━━━━▣\n┃ ❤️  *ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ*\n┠───────────────────\n┃ Status: *${now ? '🟢 ENABLED' : '🔴 DISABLED'}*\n┗━━━━━━━━━━━━━━━━━▣\n_Will ${now ? 'now' : 'no longer'} auto-react to messages._`
    });
  }
};
