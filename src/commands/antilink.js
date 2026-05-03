const settings = require('../utils/settings');
module.exports = {
  name: 'antilink',
  category: 'anti',
  description: 'Toggle anti-link in groups',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    if (!jid.endsWith('@g.us')) return sock.sendMessage(jid, { text: '❌ Groups only.' });
    const key = `antilink:${jid}`;
    const now = settings.toggle(key);
    await sock.sendMessage(jid, {
      text: `〔 ✧ ɴᴏᴏʀ-x ✧ 〕\n┏━━━━━━━━━━━━━━━━━▣\n┃ 🔗 *ᴀɴᴛɪ ʟɪɴᴋ*\n┠───────────────────\n┃ Status: *${now ? '🟢 ENABLED' : '🔴 DISABLED'}*\n┗━━━━━━━━━━━━━━━━━▣\n_Links will ${now ? 'now be deleted' : 'no longer be blocked'}._`
    });
  }
};
