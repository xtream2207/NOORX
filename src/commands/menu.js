module.exports = {
  name: 'menu',
  category: 'info',
  description: 'Show full NOOR-X command menu',
  execute: async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const p   = process.env.BOT_PREFIX || '!';
    const up  = process.uptime();
    const h=Math.floor(up/3600), m=Math.floor((up%3600)/60), s=Math.floor(up%60);
    const mem = (process.memoryUsage().heapUsed/1024/1024).toFixed(1);
    const ram = Math.round((process.memoryUsage().heapUsed/process.memoryUsage().heapTotal)*100);
    const bar = '▣'.repeat(Math.round(ram/20))+'□'.repeat(5-Math.round(ram/20));
    const sender = msg.pushName || 'User';
    const text =
`〔 ✧ ɴᴏᴏʀ-x ᴛᴇᴄʜ ✧ 〕━▣
┃╭───────────────◆
┃│ *『ɴᴏᴏʀ-x ʙᴏᴛ ᴍᴇɴᴜ』*
┃╰───────────────◆
┗━━━━━━━━━━━━━━━━━━━▣

┏━━━━━━━━━━━━━━━━━━━▣
┃ ➤ *ᴘʀᴇғɪx:* [ ${p} ]
┃ ➤ *ᴜꜱᴇʀ:* ${sender}
┃ ➤ *ᴍᴏᴅᴇ:* ᴘᴜʙʟɪᴄ
┃ ➤ *ᴘʟᴀᴛғᴏʀᴍ:* WhatsApp
┃ ➤ *ᴜᴘᴛɪᴍᴇ:* ${h}h ${m}m ${s}s
┃ ➤ *ᴠᴇʀsɪᴏɴ:* 2.0.0
┃ ➤ *ʀᴀᴍ:* ${bar} ${ram}%
┃ ➤ *ᴜsᴀɢᴇ:* ${mem}MB
┗━━━━━━━━━━━━━━━━━━━▣

┏━━━━━━━━━━━━━━━━━━━▣
┃ ✧ *ɪɴғᴏ & ᴜᴛɪʟɪᴛʏ* ✧
┃ ◇ ${p}menu   › This menu
┃ ◇ ${p}alive  › Bot status & uptime
┃ ◇ ${p}ping   › Response speed
┃ ◇ ${p}stats  › Server statistics
┃ ◇ ${p}info   › Bot information
┃ ◇ ${p}owner  › Contact owner
┃ ◇ ${p}time   › Current date & time
┗━━━━━━━━━━━━━━━━━━━▣

┏━━━━━━━━━━━━━━━━━━━▣
┃ ✧ *ᴀᴜᴛᴏ ᴍᴇɴᴜ* ✧
┃ ◇ ${p}autoread     › Auto read messages
┃ ◇ ${p}autoreact    › Auto react to msgs
┃ ◇ ${p}autotyping   › Show typing status
┃ ◇ ${p}autorecording› Show recording status
┗━━━━━━━━━━━━━━━━━━━▣

┏━━━━━━━━━━━━━━━━━━━▣
┃ ✧ *ᴀɴᴛɪ ᴍᴇɴᴜ* ✧
┃ ◇ ${p}antilink     › Block links in group
┃ ◇ ${p}antibadword  › Block bad words
┗━━━━━━━━━━━━━━━━━━━▣

┏━━━━━━━━━━━━━━━━━━━▣
┃ ✧ *ɢʀᴏᴜᴘ ᴍᴇɴᴜ* ✧
┃ ◇ ${p}everyone  › Tag all members
┃ ◇ ${p}kick      › Remove a member
┃ ◇ ${p}promote   › Promote to admin
┃ ◇ ${p}demote    › Remove admin
┗━━━━━━━━━━━━━━━━━━━▣

┏━━━━━━━━━━━━━━━━━━━▣
┃ ✧ *ᴛᴇxᴛ ᴛᴏᴏʟs* ✧
┃ ◇ ${p}calc     › Calculator
┃ ◇ ${p}reverse  › Reverse text
┃ ◇ ${p}upper    › UPPERCASE
┃ ◇ ${p}lower    › lowercase
┃ ◇ ${p}count    › Count chars/words
┃ ◇ ${p}repeat   › Repeat N times
┗━━━━━━━━━━━━━━━━━━━▣

┏━━━━━━━━━━━━━━━━━━━▣
┃ ✧ *ғᴜɴ ᴍᴇɴᴜ* ✧
┃ ◇ ${p}dice       › Roll a dice
┃ ◇ ${p}flip       › Coin flip
┃ ◇ ${p}8ball      › Magic 8 ball
┃ ◇ ${p}joke       › Random joke
┃ ◇ ${p}quote      › Inspirational quote
┃ ◇ ${p}rps        › Rock Paper Scissors
┃ ◇ ${p}rate       › Rate anything /10
┃ ◇ ${p}roast      › Get roasted 🔥
┃ ◇ ${p}compliment › Sweet compliment 💖
┃ ◇ Join Us for Updates 
┃ ◇https://whatsapp.com/channel/0029Vb7vchCCBtxK3Ria2k1i
┗━━━━━━━━━━━━━━━━━━━▣

〔 ✧ *ɴᴏᴏʀ-x ᴛᴇᴄʜ* ✧ 〕
_© 2026 NOOR-X • Always Online 🌍_`;
    
    await sock.sendMessage(jid, { text });
  }
};
