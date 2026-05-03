const quotes = [
  ['The only way to do great work is to love what you do.','Steve Jobs'],
  ['In the middle of difficulty lies opportunity.','Albert Einstein'],
  ['It does not matter how slowly you go as long as you do not stop.','Confucius'],
  ['Success is not final, failure is not fatal.','Winston Churchill'],
  ['Believe you can and you\'re halfway there.','Theodore Roosevelt'],
  ['The future belongs to those who believe in the beauty of their dreams.','Eleanor Roosevelt'],
  ['Strive not to be a success, but rather to be of value.','Albert Einstein'],
  ['The best time to plant a tree was 20 years ago. The second best time is now.','Chinese Proverb'],
  ['Dream big and dare to fail.','Norman Vaughan'],
  ['You miss 100% of the shots you don\'t take.','Wayne Gretzky'],
];
module.exports = {
  name: 'quote',
  category: 'fun',
  description: 'Inspirational quote',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const [text, author] = quotes[Math.floor(Math.random()*quotes.length)];
    await sock.sendMessage(jid, { text: `💬 *Quote of the Moment*\n\n_"${text}"_\n\n— *${author}*` });
  }
};
