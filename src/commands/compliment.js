const compliments = [
  "You light up every room you walk into! ✨",
  "Your kindness makes the world a better place. 💚",
  "You are stronger than you think! 💪",
  "You have an amazing sense of humour! 😄",
  "The world is a better place with you in it. 🌍",
  "You are absolutely one of a kind! 💎",
  "Your smile could stop traffic! 😊",
  "You make everything look effortless. 🌟",
];
module.exports = {
  name: 'compliment',
  category: 'fun',
  description: 'Receive a compliment 💖',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    await sock.sendMessage(jid, { text: `💖 *Compliment Just For You*\n\n${compliments[Math.floor(Math.random()*compliments.length)]}` });
  }
};
