const choices = ['✊ Rock','✋ Paper','✌️ Scissors'];
const validMap = { rock:0, paper:1, scissors:2 };
module.exports = {
  name: 'rps',
  category: 'fun',
  description: 'Rock Paper Scissors — !rps rock',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    if (!args[0]) return sock.sendMessage(jid, { text: '❌ Usage: *!rps rock* (rock/paper/scissors)' });
    const user = args[0].toLowerCase();
    if (!(user in validMap)) return sock.sendMessage(jid, { text: '❌ Choose: rock, paper, or scissors' });
    const botIdx = Math.floor(Math.random()*3);
    const userIdx = validMap[user];
    let result;
    if (userIdx===botIdx) result='🤝 *Draw!*';
    else if ((userIdx-botIdx+3)%3===1) result='🏆 You *Win!*';
    else result='💀 Bot *Wins!*';
    await sock.sendMessage(jid, { text: `✊✋✌️ *Rock Paper Scissors*\n\n👤 You:  ${choices[userIdx]}\n🤖 Bot:  ${choices[botIdx]}\n\n${result}` });
  }
};
