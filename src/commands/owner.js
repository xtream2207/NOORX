module.exports = {
  name: 'owner',
  category: 'info',
  description: 'Contact bot owner',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    await sock.sendMessage(jid, {
      text: `〔 ✧ ɴᴏᴏʀ-x ᴛᴇᴄʜ ✧ 〕\n┏━━━━━━━━━━━━━━━━━━━▣\n┃ 👨‍💼 *ᴏᴡɴᴇʀ ɪɴғᴏ*\n┠─────────────────────\n┃ 📱 WhatsApp: +256747304196\n┃ 📢 Channel:\n┃    https://whatsapp.com/channel/\n┃    0029Vb7vchCCBtxK3Ria2k1i\n┗━━━━━━━━━━━━━━━━━━━▣\n_Contact owner for support or custom bots._`
    });
  }
};
