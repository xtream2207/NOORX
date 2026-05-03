module.exports = {
  name: 'reverse',
  category: 'tools',
  description: 'Reverse your text',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(jid, { text: '❌ Usage: *!reverse Hello World*' });
    const rev = args.join(' ').split('').reverse().join('');
    await sock.sendMessage(jid, { text: `🔄 *${rev}*` });
  }
};
