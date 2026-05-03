module.exports = {
  name: 'ping',
  category: 'info',
  description: 'Check bot response speed',
  execute: async (sock, msg) => {
    const jid   = msg.key.remoteJid;
    const start = Date.now();
    await sock.sendMessage(jid, { text: '🏓 Pinging...' });
    const ms = Date.now() - start;
    await sock.sendMessage(jid, { text: `〔 ✧ ɴᴏᴏʀ-x ✧ 〕\n┏━━━━━━━━━━━━━━━▣\n┃ 🏓 *ᴘᴏɴɢ!*\n┠───────────────\n┃ ⚡ Speed: *${ms}ms*\n┃ 🟢 Status: Online\n┗━━━━━━━━━━━━━━━▣` });
  }
};
