module.exports = {
  name: 'repeat',
  category: 'tools',
  description: 'Repeat text N times — !repeat 3 hello',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    if (args.length < 2) return sock.sendMessage(jid, { text: '❌ Usage: *!repeat 3 hello*' });
    const n = parseInt(args[0]);
    if (isNaN(n)||n<1||n>20) return sock.sendMessage(jid, { text: '❌ Number must be 1–20.' });
    await sock.sendMessage(jid, { text: Array(n).fill(args.slice(1).join(' ')).join('\n') });
  }
};
