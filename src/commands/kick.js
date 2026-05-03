module.exports = {
  name: 'kick',
  category: 'group',
  description: 'Remove a member from group',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    if (!jid.endsWith('@g.us')) return sock.sendMessage(jid, { text: '❌ Groups only.' });
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned?.length) return sock.sendMessage(jid, { text: '❌ Usage: *!kick @user*' });
    try {
      await sock.groupParticipantsUpdate(jid, mentioned, 'remove');
      await sock.sendMessage(jid, { text: `✅ Kicked ${mentioned.length} member(s).` });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ ${e.message} — Make sure I am admin.` }); }
  }
};
