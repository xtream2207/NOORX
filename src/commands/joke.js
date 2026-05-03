const jokes = [
  ['Why don\'t scientists trust atoms?','Because they make up everything!'],
  ['Why did the scarecrow win an award?','He was outstanding in his field!'],
  ['I told my wife she was drawing her eyebrows too high.','She looked surprised.'],
  ['Why don\'t eggs tell jokes?','They\'d crack each other up.'],
  ['What do you call a fake noodle?','An impasta!'],
  ['Why can\'t you give Elsa a balloon?','She\'ll let it go.'],
  ['I\'m reading a book about anti-gravity.','It\'s impossible to put down!'],
  ['What do you call cheese that isn\'t yours?','Nacho cheese!'],
  ['I would tell you a construction joke...','But I\'m still working on it.'],
  ['What do you call a sleeping dinosaur?','A dino-snore!'],
];
module.exports = {
  name: 'joke',
  category: 'fun',
  description: 'Random joke',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const [setup, punchline] = jokes[Math.floor(Math.random()*jokes.length)];
    await sock.sendMessage(jid, { text: `😂 *Joke Time*\n\n🗣️ ${setup}\n\n🥁 ... ${punchline}` });
  }
};
