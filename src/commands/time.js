module.exports = {
  name: 'time',
  category: 'info',
  description: 'Current date and time',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const now = new Date();
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    await sock.sendMessage(jid, {
      text: `〔 ✧ ɴᴏᴏʀ-x ✧ 〕\n┏━━━━━━━━━━━━━━━━━━━▣\n┃ 🕐 *ᴅᴀᴛᴇ & ᴛɪᴍᴇ*\n┠─────────────────────\n┃ 📅 Date: ${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}\n┃ 🕐 Time: ${now.toTimeString().slice(0,8)}\n┃ 🌍 Zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n┗━━━━━━━━━━━━━━━━━━━▣`
    });
  }
};
