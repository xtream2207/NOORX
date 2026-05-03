const settings = require('../utils/settings');
module.exports = {
  name: 'antibadword',
  category: 'anti',
  description: 'Toggle bad word filter in groups',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    if (!jid.endsWith('@g.us')) return sock.sendMessage(jid, { text: '❌ Groups only.' });
    const key = `antibadword:${jid}`;
    const now = settings.toggle(key);
    await sock.sendMessage(jid, {
      text: `〔 ✧ ɴᴏᴏʀ-x ✧ 〕\n┏━━━━━━━━━━━━━━━━━▣\n┃ 🚫 *ᴀɴᴛɪ ʙᴀᴅᴡᴏʀᴅ*\n┠───────────────────\n┃ Status: *${now ? '🟢 ENABLED' : '🔴 DISABLED'}*\n┗━━━━━━━━━━━━━━━━━▣\n_Tip: use !antibadword add <word> to add words_`
    });
  }
};
