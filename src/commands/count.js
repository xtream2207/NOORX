module.exports = {
  name: 'count',
  category: 'tools',
  description: 'Count characters and words',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(jid, { text: '❌ Usage: *!count your text here*' });
    const text = args.join(' ');
    await sock.sendMessage(jid, {
      text: `〔 ✧ ɴᴏᴏʀ-x ✧ 〕\n┏━━━━━━━━━━━━━━━▣\n┃ 🔢 *ᴄᴏᴜɴᴛᴇʀ*\n┠───────────────\n┃ Characters: ${text.length}\n┃ Words:      ${text.trim().split(/\s+/).length}\n┃ Letters:    ${(text.match(/[a-zA-Z]/g)||[]).length}\n┃ Digits:     ${(text.match(/\d/g)||[]).length}\n┗━━━━━━━━━━━━━━━▣`
    });
  }
};
