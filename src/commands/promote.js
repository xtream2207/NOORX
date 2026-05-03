module.exports = {
  name: 'promote',
  category: 'group',
  description: 'Promote member to group admin',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    if (!jid.endsWith('@g.us')) return sock.sendMessage(jid, { text: '❌ Groups only.' });
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned?.length) return sock.sendMessage(jid, { text: '❌ Usage: *!promote @user*' });
    try {
      await sock.groupParticipantsUpdate(jid, mentioned, 'promote');
      await sock.sendMessage(jid, { text: `✅ Promoted ${mentioned.length} member(s) to admin. 👑` });
    } catch (e) { await sock.sendMessage(jid, { text: `❌ ${e.message}` }); }
  }
};
