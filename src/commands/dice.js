module.exports = {
  name: 'dice',
  category: 'fun',
  description: 'Roll a dice',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const faces = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣'];
    const r = Math.floor(Math.random()*6);
    await sock.sendMessage(jid, { text: `🎲 *Rolling...*\n\nYou rolled: ${faces[r]} *(${r+1})*` });
  }
};
