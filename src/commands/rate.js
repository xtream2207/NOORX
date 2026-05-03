module.exports = {
  name: 'rate',
  category: 'fun',
  description: 'Rate anything out of 10',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(jid, { text: '❌ Usage: *!rate pizza*' });
    const score = Math.floor(Math.random()*11);
    const bar = '⭐'.repeat(score)+'☆'.repeat(10-score);
    await sock.sendMessage(jid, { text: `⭐ *Rating*\n\n📌 ${args.join(' ')}\n\n${bar}\n\n🏅 Score: *${score}/10*` });
  }
};
