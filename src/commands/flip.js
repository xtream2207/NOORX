module.exports = {
  name: 'flip',
  category: 'fun',
  description: 'Flip a coin',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const result = Math.random() < 0.5 ? '🪙 *HEADS!*' : '🪙 *TAILS!*';
    await sock.sendMessage(jid, { text: `*Flipping coin...*\n\n${result}` });
  }
};
