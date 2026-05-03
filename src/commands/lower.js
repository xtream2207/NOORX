module.exports = {
  name: 'lower',
  category: 'tools',
  description: 'lowercase text',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(jid, { text: '❌ Usage: *!lower TEXT*' });
    await sock.sendMessage(jid, { text: `🔡 ${args.join(' ').toLowerCase()}` });
  }
};
