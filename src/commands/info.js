module.exports = {
  name: 'info',
  category: 'info',
  description: 'Bot information',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    await sock.sendMessage(jid, {
      text: `〔 ✧ ɴᴏᴏʀ-x ᴛᴇᴄʜ ✧ 〕\n┏━━━━━━━━━━━━━━━━━━━▣\n┃ ℹ️  *ʙᴏᴛ ɪɴғᴏ*\n┠─────────────────────\n┃ 🤖 Name:     NOOR-X Bot\n┃ 📌 Version:  2.0.0\n┃ ⚡ Engine:   Baileys v6\n┃ 🌍 Mode:     Always Online\n┃ 🔧 Prefix:   ! (exclamation)\n┃ 👤 Owner:    +256747304196\n┃ 📢 Channel:  whatsapp.com/channel/\n┃              0029Vb7vchCCBtxK3Ria2k1i\n┗━━━━━━━━━━━━━━━━━━━▣\n_Powered by NOOR-X Tech © 2026_`
    });
  }
};
