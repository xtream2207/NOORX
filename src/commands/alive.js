module.exports = {
  name: 'alive',
  category: 'info',
  description: 'Check bot status',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const up  = process.uptime();
    const h=Math.floor(up/3600), m=Math.floor((up%3600)/60), s=Math.floor(up%60);
    const mem = (process.memoryUsage().heapUsed/1024/1024).toFixed(1);
    const start = Date.now();
    await sock.sendMessage(jid, {
      text: `〔 ✧ ɴᴏᴏʀ-x ᴛᴇᴄʜ ✧ 〕━▣\n┏━━━━━━━━━━━━━━━━━━━▣\n┃ 🟢 *ɴᴏᴏʀ-x ɪs ᴀʟɪᴠᴇ!*\n┠─────────────────────\n┃ ⚡ *Status:*   Online ✅\n┃ 🌍 *Mode:*     Always Online\n┃ ⏱️  *Uptime:*  ${h}h ${m}m ${s}s\n┃ 💾 *Memory:*  ${mem} MB\n┃ 🤖 *Engine:*  Baileys v6\n┃ 📌 *Version:* 2.0.0\n┗━━━━━━━━━━━━━━━━━━━▣\n_NOOR-X is running strong! 💪_`
    });
  }
};
