module.exports = {
  name: 'calc',
  category: 'tools',
  description: 'Calculator — !calc 10*5+3',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(jid, { text: '❌ Usage: *!calc 10*5+3*' });
    const expr = args.join(' ').replace(/[^0-9\s\+\-\*\/\(\)\.%]/g, '');
    if (!expr.trim()) return sock.sendMessage(jid, { text: '❌ Only numbers and + - * / ( ) % allowed.' });
    try {
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict";return(' + expr + ')')();
      if (!isFinite(result)) return sock.sendMessage(jid, { text: '❌ Result is not a number.' });
      await sock.sendMessage(jid, { text: `〔 ✧ ɴᴏᴏʀ-x ✧ 〕\n┏━━━━━━━━━━━━━━━▣\n┃ 🧮 *ᴄᴀʟᴄ*\n┠───────────────\n┃ 📥 ${expr}\n┃ 📤 *${result}*\n┗━━━━━━━━━━━━━━━▣` });
    } catch { await sock.sendMessage(jid, { text: '❌ Invalid expression.' }); }
  }
};
