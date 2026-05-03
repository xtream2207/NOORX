const logger = require('../utils/logger');
const db = require('../utils/database');
const config = require('../config');

async function checkChannelMembership() {
    logger.info('🔄 Starting channel membership check...');

    let connectedUsers = [];
    try {
        connectedUsers = db.getConnectedUsers();
    } catch (err) {
        logger.error('Failed to get connected users:', err.message);
        return;
    }

    if (connectedUsers.length === 0) {
        logger.info('ℹ️  No connected users to check');
        return;
    }

    const channelId = config.WHATSAPP_CHANNEL_ID;
    if (!channelId) {
        logger.warn('WHATSAPP_CHANNEL_ID is not set — skipping channel check');
        return;
    }

    let checked = 0, readded = 0, failed = 0;

    for (const user of connectedUsers) {
        try {
            const session = db.getSession(user.userId);
            if (!session) {
                logger.warn(`No session found for ${user.userId} — skipping`);
                continue;
            }

            const metadata = await session.groupMetadata(channelId).catch(() => null);
            checked++;

            if (!metadata) {
                logger.info(`📢 ${user.phoneNumber} not in channel — re-adding...`);
                try {
                    await session.groupParticipantsUpdate(channelId, [user.phoneNumber], 'add');
                    logger.success(`✅ Re-added ${user.phoneNumber} to channel`);
                    readded++;
                } catch (addErr) {
                    logger.error(`Failed to re-add ${user.phoneNumber}:`, addErr.message);
                    failed++;
                }
            } else {
                logger.info(`✅ ${user.phoneNumber} is in channel`);
            }
        } catch (err) {
            logger.error(`Error checking ${user.phoneNumber}:`, err.message);
            failed++;
        }
    }

    logger.success(`✅ Channel check done — checked: ${checked}, re-added: ${readded}, failed: ${failed}`);
}

const TEN_HOURS = 10 * 60 * 60 * 1000;

function startChannelCheck() {
    logger.info('⏰ Channel check scheduled (runs every 10 hours)');
    // Run once right away, then on interval
    checkChannelMembership().catch(err => {
        logger.error('Initial channel check failed:', err.message);
    });
    setInterval(() => {
        checkChannelMembership().catch(err => {
            logger.error('Scheduled channel check failed:', err.message);
        });
    }, TEN_HOURS);
}

module.exports = { checkChannelMembership, startChannelCheck };
