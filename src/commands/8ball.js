const answers = [
  '✅ Yes, definitely!','✅ Without a doubt!','✅ Most likely.',
  '✅ Signs point to yes.','🔮 Ask again later.','🤔 Cannot predict now.',
  '❌ Don\'t count on it.','❌ My reply is no.','❌ Very doubtful.',
  '🎱 It is certain!','🎱 Outlook not so good.','🤷 Who knows?'
];
module.exports = {
  name: '8ball',
  category: 'fun',
  description: 'Magic 8 ball',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    if (!args.length) return sock.sendMessage(jid, { text: '❌ Usage: *!8ball Will I win today?*' });
    const ans = answers[Math.floor(Math.random()*answers.length)];
    await sock.sendMessage(jid, { text: `🎱 *Magic 8 Ball*\n\n❓ ${args.join(' ')}\n\n${ans}` });
  }
};
