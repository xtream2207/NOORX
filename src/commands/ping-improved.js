// ping-improved.js

/**
 * Improved Ping Command
 * Includes error handling, rate limiting, validation, logging, and enhanced metrics.
 */

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let pingTimes = [];
const MAX_PINGS = 5;
const RATE_LIMIT_MS = 1000; // 1 second
let lastPingTime = 0;

client.on('messageCreate', async (message) => {
    if (message.content === '!ping') {
        const currentTime = Date.now();
        if (currentTime - lastPingTime < RATE_LIMIT_MS) {
            return message.channel.send('Please wait before using the ping command again.');
        }

        lastPingTime = currentTime;

        const start = Date.now();
        try {
            const msg = await message.channel.send('Pinging...');
            const latency = Date.now() - start;
            pingTimes.push(latency);

            if (pingTimes.length > MAX_PINGS) {
                pingTimes.shift(); // Remove the oldest ping time
            }

            const averagePing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
            await msg.edit(`Pong! Latency is ${latency}ms. Average latency is ${averagePing.toFixed(2)}ms.`);
            console.log(`Ping command executed. Latency: ${latency}ms, Average: ${averagePing.toFixed(2)}ms`);

        } catch (error) {
            console.error('Error while executing ping command:', error);
            message.channel.send('An error occurred while processing your request.');
        }
    }
});

client.login('YOUR_BOT_TOKEN');
