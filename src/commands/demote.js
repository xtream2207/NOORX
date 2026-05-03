module.exports = {
  name: 'demote',
  category: 'group',
  description: 'Remove admin rights from member',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    if (!jid.endsWith('@g.us')) return sock.sendMessage(jid, { text: '❌ Groups only.' });
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned?.length) return sock.sendMessage(jid, { text: '❌ Usage: *!demote @user*' });
    try {
      await sock.groupParticipantsUpdate(jid, mentioned, 'demote');
      await sock.sendMessage(jid, { text: `✅ Demoted ${mentioned.length} member(s) from admin.` });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ ${e.message}` }); }
  }
};
