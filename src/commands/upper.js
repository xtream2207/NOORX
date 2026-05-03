module.exports = {
  name: 'upper',
  category: 'tools',
  description: 'UPPERCASE text',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(jid, { text: '❌ Usage: *!upper text*' });
    await sock.sendMessage(jid, { text: `🔠 *${args.join(' ').toUpperCase()}*` });
  }
};
