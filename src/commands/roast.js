const roasts = [
  "I'd agree with you but then we'd both be wrong. 😂",
  "You're proof that even evolution makes mistakes. 🦕",
  "Talking to you is like reading terms & conditions. 📄",
  "You must have been born on a highway — that's where most accidents happen. 🛣️",
  "You're like a cloud — when you disappear, it's a beautiful day. ☀️",
  "I'd roast you harder but my mom said I'm not allowed to burn trash. 🗑️",
  "You have the perfect face for radio. 📻",
  "I've seen better arguments in a kindergarten class. 👶",
];
module.exports = {
  name: 'roast',
  category: 'fun',
  description: 'Get roasted 🔥',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    await sock.sendMessage(jid, { text: `🔥 *ROASTED!*\n\n${roasts[Math.floor(Math.random()*roasts.length)]}` });
  }
};
